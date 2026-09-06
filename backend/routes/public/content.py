from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import Event, Gallery

router = APIRouter(prefix="/public", tags=["Public"])


@router.get("/events")
async def get_events(db: AsyncSession = Depends(get_db)):
    r = await db.execute(
        select(Event)
        .where(Event.is_published == True)
        .order_by(Event.event_date.desc())
    )
    events = r.scalars().all()
    return [
        {
            "id": str(e.id),
            "title": e.title,
            "description": e.description,
            "event_date": e.event_date.isoformat(),
            "image_url": e.image_url,
        }
        for e in events
    ]


@router.get("/gallery")
async def get_gallery(
    category: str = "",
    db: AsyncSession = Depends(get_db),
):
    q = select(Gallery).order_by(Gallery.created_at.desc())
    if category:
        q = q.where(Gallery.category == category)
    r = await db.execute(q)
    items = r.scalars().all()
    return [
        {
            "id": str(g.id),
            "title": g.title,
            "image_url": g.image_url,
            "category": g.category,
        }
        for g in items
    ]


@router.get("/gallery/categories")
async def get_gallery_categories(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import distinct
    r = await db.execute(select(distinct(Gallery.category)))
    return [row[0] for row in r.all()]
