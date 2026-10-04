from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import get_db
from models import HallOfFame
from utils.auth import require_admin
from services.storage import upload_photo

router = APIRouter(prefix="/admin/hall-of-fame", tags=["Admin - Hall of Fame"])

CATEGORIES = ["SSC", "HSC", "BCS", "Admission", "Other"]


class HallOfFameCreate(BaseModel):
    student_name: str
    achievement: str
    category: str
    description: Optional[str] = None
    year: int
    is_published: bool = True
    display_order: int = 0


class HallOfFameUpdate(BaseModel):
    student_name: Optional[str] = None
    achievement: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    year: Optional[int] = None
    is_published: Optional[bool] = None
    display_order: Optional[int] = None


@router.get("")
async def list_entries(
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    r = await db.execute(
        select(HallOfFame).order_by(HallOfFame.display_order.asc(), HallOfFame.year.desc())
    )
    return [_to_dict(h) for h in r.scalars().all()]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_entry(
    body: HallOfFameCreate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    if body.category not in CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Category must be one of: {', '.join(CATEGORIES)}")
    entry = HallOfFame(**body.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return _to_dict(entry)


@router.put("/{entry_id}")
async def update_entry(
    entry_id: str,
    body: HallOfFameUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    entry = await db.get(HallOfFame, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(entry, k, v)
    await db.commit()
    await db.refresh(entry)
    return _to_dict(entry)


@router.post("/{entry_id}/photo")
async def upload_entry_photo(
    entry_id: str,
    photo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    entry = await db.get(HallOfFame, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    if photo.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP allowed")
    file_bytes = await photo.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Photo must be under 5MB")
    url = await upload_photo(file_bytes, photo.content_type, folder="hall-of-fame")
    if not url:
        raise HTTPException(status_code=500, detail="Photo upload failed")
    entry.photo_url = url
    await db.commit()
    return {"photo_url": url}


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    entry = await db.get(HallOfFame, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    await db.delete(entry)
    await db.commit()


def _to_dict(h: HallOfFame) -> dict:
    return {
        "id": str(h.id),
        "student_name": h.student_name,
        "achievement": h.achievement,
        "category": h.category,
        "description": h.description,
        "photo_url": h.photo_url,
        "year": h.year,
        "is_published": h.is_published,
        "display_order": h.display_order,
        "created_at": h.created_at.isoformat(),
    }
