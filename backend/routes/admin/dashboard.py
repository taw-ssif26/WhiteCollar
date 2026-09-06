from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from database import get_db
from models import Student, Result, Invoice, Event, Gallery, Admin
from utils.auth import require_admin, hash_password, verify_password
from services.storage import upload_photo

router = APIRouter(prefix="/admin", tags=["Admin - Dashboard"])


@router.get("/dashboard")
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    total_students = (await db.execute(select(func.count()).select_from(Student))).scalar()
    active_students = (await db.execute(select(func.count()).select_from(Student).where(Student.is_active == True))).scalar()
    total_results = (await db.execute(select(func.count()).select_from(Result))).scalar()
    unpaid_invoices = (await db.execute(select(func.count()).select_from(Invoice).where(Invoice.is_paid == False))).scalar()
    paid_invoices = (await db.execute(select(func.count()).select_from(Invoice).where(Invoice.is_paid == True))).scalar()

    # Total revenue collected
    revenue_result = await db.execute(
        select(func.sum(Invoice.amount)).where(Invoice.is_paid == True)
    )
    total_revenue = float(revenue_result.scalar() or 0)

    # Recent results (last 5)
    recent_results = await db.execute(
        select(Result, Student)
        .join(Student, Result.student_id == Student.id)
        .order_by(Result.created_at.desc())
        .limit(5)
    )
    recent_results_list = [
        {
            "student_name": s.name,
            "student_id": s.student_id,
            "exam_name": r.exam_name,
            "percentage": round((r.obtained_marks / r.total_marks) * 100, 1) if r.total_marks > 0 else 0,
            "exam_date": str(r.exam_date),
        }
        for r, s in recent_results.all()
    ]

    # Students with unpaid fees
    unpaid_students = await db.execute(
        select(Student, Invoice)
        .join(Invoice, Invoice.student_id == Student.id)
        .where(Invoice.is_paid == False)
        .order_by(Invoice.due_date.asc())
        .limit(10)
    )
    unpaid_list = [
        {
            "student_name": s.name,
            "student_id": s.student_id,
            "invoice_number": inv.invoice_number,
            "amount": float(inv.amount),
            "due_date": str(inv.due_date),
        }
        for s, inv in unpaid_students.all()
    ]

    return {
        "stats": {
            "total_students": total_students,
            "active_students": active_students,
            "total_results": total_results,
            "unpaid_invoices": unpaid_invoices,
            "paid_invoices": paid_invoices,
            "total_revenue": total_revenue,
        },
        "recent_results": recent_results_list,
        "unpaid_fees": unpaid_list,
    }


# ─── Admin Password Change ────────────────────────────────────────────────────

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
async def change_admin_password(
    body: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_admin),
):
    import uuid as _uuid
    admin = await db.get(Admin, _uuid.UUID(payload["sub"]))
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    if not verify_password(body.current_password, admin.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    admin.password_hash = hash_password(body.new_password)
    await db.commit()
    return {"message": "Password changed successfully"}


# ─── Events ───────────────────────────────────────────────────────────────────

class EventCreate(BaseModel):
    title: str
    description: str
    event_date: datetime
    is_published: bool = True


@router.get("/events")
async def list_events(db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    r = await db.execute(select(Event).order_by(Event.event_date.desc()))
    return [_event_dict(e) for e in r.scalars().all()]


@router.post("/events", status_code=status.HTTP_201_CREATED)
async def create_event(body: EventCreate, db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    event = Event(**body.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return _event_dict(event)


@router.post("/events/{event_id}/image")
async def upload_event_image(
    event_id: str,
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    file_bytes = await image.read()
    url = await upload_photo(file_bytes, image.content_type, folder="events")
    if not url:
        raise HTTPException(status_code=500, detail="Image upload failed")

    event.image_url = url
    await db.commit()
    return {"image_url": url}


@router.put("/events/{event_id}")
async def update_event(event_id: str, body: EventCreate, db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for k, v in body.model_dump().items():
        setattr(event, k, v)
    await db.commit()
    await db.refresh(event)
    return _event_dict(event)


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: str, db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.delete(event)
    await db.commit()


# ─── Gallery ──────────────────────────────────────────────────────────────────

class GalleryCreate(BaseModel):
    title: str
    category: str = "General"


@router.get("/gallery")
async def list_gallery(db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    r = await db.execute(select(Gallery).order_by(Gallery.created_at.desc()))
    return [_gallery_dict(g) for g in r.scalars().all()]


@router.post("/gallery", status_code=status.HTTP_201_CREATED)
async def create_gallery_item(
    title: str,
    category: str = "General",
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    file_bytes = await image.read()
    url = await upload_photo(file_bytes, image.content_type, folder="gallery")
    if not url:
        raise HTTPException(status_code=500, detail="Image upload failed")

    item = Gallery(title=title, category=category, image_url=url)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return _gallery_dict(item)


@router.delete("/gallery/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gallery_item(item_id: str, db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    item = await db.get(Gallery, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    await db.delete(item)
    await db.commit()


def _event_dict(e: Event) -> dict:
    return {
        "id": str(e.id),
        "title": e.title,
        "description": e.description,
        "event_date": e.event_date.isoformat(),
        "image_url": e.image_url,
        "is_published": e.is_published,
        "created_at": e.created_at.isoformat(),
    }


def _gallery_dict(g: Gallery) -> dict:
    return {
        "id": str(g.id),
        "title": g.title,
        "image_url": g.image_url,
        "category": g.category,
        "created_at": g.created_at.isoformat(),
    }
