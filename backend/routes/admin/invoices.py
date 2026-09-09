from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import Invoice, Student
from utils.auth import require_admin
from services.whatsapp import send_whatsapp, build_payment_confirmation_message

router = APIRouter(prefix="/admin/invoices", tags=["Admin - Invoices"])


class InvoiceCreate(BaseModel):
    student_id: str
    amount: float
    description: str
    issue_date: date
    due_date: date


class InvoiceUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    is_paid: Optional[bool] = None


def _generate_invoice_number(count: int) -> str:
    year = datetime.now().year
    month = datetime.now().month
    return f"INV-{year}{str(month).zfill(2)}-{str(count + 1).zfill(4)}"


@router.get("")
async def list_invoices(
    student_id: str = "",
    is_paid: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    q = (
        select(Invoice, Student)
        .join(Student, Invoice.student_id == Student.id)
        .order_by(Invoice.created_at.desc())
    )
    if student_id:
        q = q.where(Student.student_id == student_id)
    if is_paid is not None:
        q = q.where(Invoice.is_paid == is_paid)

    rows = await db.execute(q)
    return [_invoice_to_dict(inv, s) for inv, s in rows.all()]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_invoice(
    body: InvoiceCreate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    student = await _get_student_or_404(db, body.student_id)

    count_result = await db.execute(select(func.count()).select_from(Invoice))
    count = count_result.scalar()
    invoice_number = _generate_invoice_number(count)

    invoice = Invoice(
        student_id=student.id,
        invoice_number=invoice_number,
        amount=body.amount,
        description=body.description,
        issue_date=body.issue_date,
        due_date=body.due_date,
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)

    # WhatsApp is sent when marked paid, not on creation
    return {**_invoice_to_dict(invoice, student), "whatsapp_sent": False}


@router.post("/{invoice_id}/mark-paid")
async def mark_invoice_paid(
    invoice_id: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    rows = await db.execute(
        select(Invoice, Student)
        .join(Student, Invoice.student_id == Student.id)
        .where(Invoice.id == invoice_id)
    )
    row = rows.first()
    if not row:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice, student = row
    invoice.is_paid = True
    invoice.paid_at = datetime.now(timezone.utc)

    # Send WhatsApp payment confirmation
    message = build_payment_confirmation_message(
        student_name=student.name,
        invoice_number=invoice.invoice_number,
        amount=float(invoice.amount),
        description=invoice.description,
        paid_at=str(datetime.now(timezone.utc).strftime("%d %b %Y")),
    )
    sent = await send_whatsapp(student.whatsapp_number, message)
    invoice.whatsapp_sent = sent
    await db.commit()

    return {**_invoice_to_dict(invoice, student), "whatsapp_sent": sent}


@router.post("/{invoice_id}/send-whatsapp")
async def resend_invoice_whatsapp(
    invoice_id: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    rows = await db.execute(
        select(Invoice, Student)
        .join(Student, Invoice.student_id == Student.id)
        .where(Invoice.id == invoice_id)
    )
    row = rows.first()
    if not row:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice, student = row
    message = build_payment_confirmation_message(
        student_name=student.name,
        invoice_number=invoice.invoice_number,
        amount=float(invoice.amount),
        description=invoice.description,
        paid_at=str(invoice.paid_at.strftime("%d %b %Y")) if invoice.paid_at else "N/A",
    )
    sent = await send_whatsapp(student.whatsapp_number, message)
    if sent:
        invoice.whatsapp_sent = True
        await db.commit()
    return {"sent": sent}


@router.put("/{invoice_id}")
async def update_invoice(
    invoice_id: str,
    body: InvoiceUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    invoice = await _get_invoice_or_404(db, invoice_id)
    for field, value in body.model_dump(exclude_none=True).items():
        if field == "is_paid" and value:
            invoice.paid_at = datetime.now(timezone.utc)
        setattr(invoice, field, value)
    await db.commit()
    await db.refresh(invoice)
    student = await db.get(Student, invoice.student_id)
    return _invoice_to_dict(invoice, student)


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    invoice = await _get_invoice_or_404(db, invoice_id)
    await db.delete(invoice)
    await db.commit()


async def _get_student_or_404(db: AsyncSession, student_id: str) -> Student:
    r = await db.execute(select(Student).where(Student.student_id == student_id))
    s = r.scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=404, detail=f"Student {student_id} not found")
    return s


async def _get_invoice_or_404(db: AsyncSession, invoice_id: str) -> Invoice:
    inv = await db.get(Invoice, invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return inv


def _invoice_to_dict(inv: Invoice, s: Student) -> dict:
    return {
        "id": str(inv.id),
        "invoice_number": inv.invoice_number,
        "student_id": s.student_id,
        "student_name": s.name,
        "amount": float(inv.amount),
        "description": inv.description,
        "issue_date": str(inv.issue_date),
        "due_date": str(inv.due_date),
        "is_paid": inv.is_paid,
        "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
        "whatsapp_sent": inv.whatsapp_sent,
        "created_at": inv.created_at.isoformat(),
    }
