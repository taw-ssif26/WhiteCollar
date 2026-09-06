import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import Student
from utils.auth import hash_password, require_admin
from utils.csv_parser import parse_student_csv
from services.storage import upload_photo, delete_photo

router = APIRouter(prefix="/admin/students", tags=["Admin - Students"])


def _generate_student_id(count: int) -> str:
    year = datetime.now().year
    return f"WC-{year}-{str(count + 1).zfill(3)}"


class StudentCreate(BaseModel):
    name: str
    school_college: str
    class_level: str
    batch: str
    gender: str
    email: Optional[str] = None
    whatsapp_number: str
    password: Optional[str] = None  # defaults to student_id if not provided


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    school_college: Optional[str] = None
    class_level: Optional[str] = None
    batch: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    whatsapp_number: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


@router.get("")
async def list_students(
    search: str = "",
    batch: str = "",
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    q = select(Student)
    if search:
        q = q.where(Student.name.ilike(f"%{search}%") | Student.student_id.ilike(f"%{search}%"))
    if batch:
        q = q.where(Student.batch == batch)
    if is_active is not None:
        q = q.where(Student.is_active == is_active)
    q = q.order_by(Student.created_at.desc())

    result = await db.execute(q)
    students = result.scalars().all()

    return [_student_to_dict(s) for s in students]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_student(
    body: StudentCreate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    count_result = await db.execute(select(func.count()).select_from(Student))
    count = count_result.scalar()
    student_id = _generate_student_id(count)

    password = body.password or student_id  # default password = student ID

    student = Student(
        student_id=student_id,
        name=body.name,
        school_college=body.school_college,
        class_level=body.class_level,
        batch=body.batch,
        gender=body.gender,
        email=body.email,
        whatsapp_number=body.whatsapp_number,
        password_hash=hash_password(password),
    )
    db.add(student)
    await db.commit()
    await db.refresh(student)
    return {**_student_to_dict(student), "default_password": password}


@router.get("/{student_id}")
async def get_student(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    student = await _get_or_404(db, student_id)
    return _student_to_dict(student)


@router.put("/{student_id}")
async def update_student(
    student_id: str,
    body: StudentUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    student = await _get_or_404(db, student_id)

    for field, value in body.model_dump(exclude_none=True).items():
        if field == "password":
            student.password_hash = hash_password(value)
        else:
            setattr(student, field, value)

    await db.commit()
    await db.refresh(student)
    return _student_to_dict(student)


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    student = await _get_or_404(db, student_id)
    if student.photo_url:
        await delete_photo(student.photo_url)
    await db.delete(student)
    await db.commit()


@router.post("/{student_id}/photo")
async def upload_student_photo(
    student_id: str,
    photo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    student = await _get_or_404(db, student_id)

    if photo.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP photos are allowed")

    file_bytes = await photo.read()
    if len(file_bytes) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="Photo must be under 5MB")

    if student.photo_url:
        await delete_photo(student.photo_url)

    url = await upload_photo(file_bytes, photo.content_type)
    if not url:
        raise HTTPException(status_code=500, detail="Photo upload failed — check R2 configuration")

    student.photo_url = url
    await db.commit()
    return {"photo_url": url}


@router.post("/bulk-import")
async def bulk_import_students(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file")

    file_bytes = await file.read()
    rows, errors = parse_student_csv(file_bytes)

    if not rows and errors:
        raise HTTPException(status_code=422, detail={"message": "CSV has errors", "errors": errors})

    count_result = await db.execute(select(func.count()).select_from(Student))
    base_count = count_result.scalar()

    created = []
    for i, row in enumerate(rows):
        student_id = _generate_student_id(base_count + i)
        student = Student(
            student_id=student_id,
            password_hash=hash_password(student_id),
            **row,
        )
        db.add(student)
        created.append({"name": row["name"], "student_id": student_id, "default_password": student_id})

    await db.commit()
    return {
        "created": len(created),
        "errors": errors,
        "students": created,
    }


async def _get_or_404(db: AsyncSession, student_id: str) -> Student:
    result = await db.execute(select(Student).where(Student.student_id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


def _student_to_dict(s: Student) -> dict:
    return {
        "id": str(s.id),
        "student_id": s.student_id,
        "name": s.name,
        "school_college": s.school_college,
        "class_level": s.class_level,
        "batch": s.batch,
        "gender": s.gender,
        "email": s.email,
        "whatsapp_number": s.whatsapp_number,
        "photo_url": s.photo_url,
        "is_active": s.is_active,
        "created_at": s.created_at.isoformat(),
    }
