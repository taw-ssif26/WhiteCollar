from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import HallOfFame

router = APIRouter(prefix="/public/hall-of-fame", tags=["Public - Hall of Fame"])


@router.get("")
async def get_hall_of_fame(
    category: str = "",
    year: int = 0,
    db: AsyncSession = Depends(get_db),
):
    q = (
        select(HallOfFame)
        .where(HallOfFame.is_published == True)
        .order_by(HallOfFame.display_order.asc(), HallOfFame.year.desc())
    )
    if category:
        q = q.where(HallOfFame.category == category)
    if year:
        q = q.where(HallOfFame.year == year)
    r = await db.execute(q)
    return [
        {
            "id": str(h.id),
            "student_name": h.student_name,
            "achievement": h.achievement,
            "category": h.category,
            "description": h.description,
            "photo_url": h.photo_url,
            "year": h.year,
        }
        for h in r.scalars().all()
    ]


@router.get("/years")
async def get_years(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import distinct
    r = await db.execute(
        select(distinct(HallOfFame.year))
        .where(HallOfFame.is_published == True)
        .order_by(HallOfFame.year.desc())
    )
    return [row[0] for row in r.all()]
