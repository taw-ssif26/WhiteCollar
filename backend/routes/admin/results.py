from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import date
from typing import Optional
from database import get_db
from models import Result, Student
from utils.auth import require_admin
from services.whatsapp import send_whatsapp, build_result_message

router = APIRouter(prefix="/admin/results", tags=["Admin - Results"])


class ResultCreate(BaseModel):
    student_id: str  # student_id like WC-2025-001
    exam_name: str
    total_marks: int
    obtained_marks: int
    exam_date: date
    remarks: Optional[str] = None
    send_whatsapp: bool = True


class ResultUpdate(BaseModel):
    exam_name: Optional[str] = None
    total_marks: Optional[int] = None
    obtained_marks: Optional[int] = None
    exam_date: Optional[date] = None
    remarks: Optional[str] = None


@router.get("")
async def list_results(
    student_id: str = "",
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    q = (
        select(Result, Student)
        .join(Student, Result.student_id == Student.id)
        .order_by(Result.created_at.desc())
    )
    if student_id:
        q = q.where(Student.student_id == student_id)

    rows = await db.execute(q)
    return [_result_to_dict(r, s) for r, s in rows.all()]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_result(
    body: ResultCreate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    student = await _get_student_or_404(db, body.student_id)

    if body.obtained_marks > body.total_marks:
        raise HTTPException(status_code=400, detail="Obtained marks cannot exceed total marks")

    result = Result(
        student_id=student.id,
        exam_name=body.exam_name,
        total_marks=body.total_marks,
        obtained_marks=body.obtained_marks,
        exam_date=body.exam_date,
        remarks=body.remarks,
    )
    db.add(result)
    await db.commit()
    await db.refresh(result)

    whatsapp_sent = False
    if body.send_whatsapp:
        message = build_result_message(
            student_name=student.name,
            exam_name=body.exam_name,
            obtained=body.obtained_marks,
            total=body.total_marks,
            exam_date=str(body.exam_date),
            remarks=body.remarks,
        )
        whatsapp_sent = await send_whatsapp(student.whatsapp_number, message)
        result.whatsapp_sent = whatsapp_sent
        await db.commit()

    return {**_result_to_dict(result, student), "whatsapp_sent": whatsapp_sent}


@router.post("/{result_id}/send-whatsapp")
async def resend_result_whatsapp(
    result_id: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    rows = await db.execute(
        select(Result, Student)
        .join(Student, Result.student_id == Student.id)
        .where(Result.id == result_id)
    )
    row = rows.first()
    if not row:
        raise HTTPException(status_code=404, detail="Result not found")

    result, student = row
    message = build_result_message(
        student_name=student.name,
        exam_name=result.exam_name,
        obtained=result.obtained_marks,
        total=result.total_marks,
        exam_date=str(result.exam_date),
        remarks=result.remarks,
    )
    sent = await send_whatsapp(student.whatsapp_number, message)
    if sent:
        result.whatsapp_sent = True
        await db.commit()
    return {"sent": sent}


@router.put("/{result_id}")
async def update_result(
    result_id: str,
    body: ResultUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    result = await _get_result_or_404(db, result_id)
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(result, field, value)
    await db.commit()
    await db.refresh(result)

    student = await db.get(Student, result.student_id)
    return _result_to_dict(result, student)


@router.delete("/{result_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_result(
    result_id: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    result = await _get_result_or_404(db, result_id)
    await db.delete(result)
    await db.commit()


async def _get_student_or_404(db: AsyncSession, student_id: str) -> Student:
    r = await db.execute(select(Student).where(Student.student_id == student_id))
    student = r.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student {student_id} not found")
    return student


async def _get_result_or_404(db: AsyncSession, result_id: str) -> Result:
    result = await db.get(Result, result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result


def _result_to_dict(r: Result, s: Student) -> dict:
    percentage = round((r.obtained_marks / r.total_marks) * 100, 1) if r.total_marks > 0 else 0
    return {
        "id": str(r.id),
        "student_id": s.student_id,
        "student_name": s.name,
        "exam_name": r.exam_name,
        "total_marks": r.total_marks,
        "obtained_marks": r.obtained_marks,
        "percentage": percentage,
        "exam_date": str(r.exam_date),
        "remarks": r.remarks,
        "whatsapp_sent": r.whatsapp_sent,
        "created_at": r.created_at.isoformat(),
    }
