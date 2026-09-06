from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from database import get_db
from models import Student, Result, Invoice
from utils.auth import require_student, hash_password, verify_password
import uuid

router = APIRouter(prefix="/student", tags=["Student Portal"])


def _get_student_id_from_token(payload: dict) -> uuid.UUID:
    return uuid.UUID(payload["sub"])


@router.get("/profile")
async def get_profile(
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_student),
):
    student = await db.get(Student, _get_student_id_from_token(payload))
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return {
        "student_id": student.student_id,
        "name": student.name,
        "school_college": student.school_college,
        "class_level": student.class_level,
        "batch": student.batch,
        "gender": student.gender,
        "email": student.email,
        "whatsapp_number": student.whatsapp_number,
        "photo_url": student.photo_url,
    }


@router.get("/results")
async def get_results(
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_student),
):
    student_uuid = _get_student_id_from_token(payload)
    r = await db.execute(
        select(Result)
        .where(Result.student_id == student_uuid)
        .order_by(Result.exam_date.desc())
    )
    results = r.scalars().all()
    return [
        {
            "id": str(res.id),
            "exam_name": res.exam_name,
            "total_marks": res.total_marks,
            "obtained_marks": res.obtained_marks,
            "percentage": round((res.obtained_marks / res.total_marks) * 100, 1) if res.total_marks > 0 else 0,
            "exam_date": str(res.exam_date),
            "remarks": res.remarks,
        }
        for res in results
    ]


@router.get("/invoices")
async def get_invoices(
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_student),
):
    student_uuid = _get_student_id_from_token(payload)
    r = await db.execute(
        select(Invoice)
        .where(Invoice.student_id == student_uuid)
        .order_by(Invoice.created_at.desc())
    )
    invoices = r.scalars().all()
    return [
        {
            "id": str(inv.id),
            "invoice_number": inv.invoice_number,
            "amount": float(inv.amount),
            "description": inv.description,
            "issue_date": str(inv.issue_date),
            "due_date": str(inv.due_date),
            "is_paid": inv.is_paid,
            "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
        }
        for inv in invoices
    ]


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_student),
):
    student = await db.get(Student, _get_student_id_from_token(payload))
    if not verify_password(body.current_password, student.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    student.password_hash = hash_password(body.new_password)
    await db.commit()
    return {"message": "Password changed successfully"}
