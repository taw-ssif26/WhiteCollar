from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import Event, Gallery, Enquiry, Review

router = APIRouter(prefix="/public", tags=["Public"])


@router.get("/events")
async def get_events(db: AsyncSession = Depends(get_db)):
    r = await db.execute(
        select(Event).where(Event.is_published == True).order_by(Event.event_date.desc())
    )
    return [
        {"id": str(e.id), "title": e.title, "description": e.description,
         "event_date": e.event_date.isoformat(), "image_url": e.image_url}
        for e in r.scalars().all()
    ]


@router.get("/gallery")
async def get_gallery(category: str = "", db: AsyncSession = Depends(get_db)):
    q = select(Gallery).order_by(Gallery.created_at.desc())
    if category:
        q = q.where(Gallery.category == category)
    r = await db.execute(q)
    return [
        {"id": str(g.id), "title": g.title, "image_url": g.image_url, "category": g.category}
        for g in r.scalars().all()
    ]


@router.get("/gallery/categories")
async def get_gallery_categories(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import distinct
    r = await db.execute(select(distinct(Gallery.category)))
    return [row[0] for row in r.all()]


class EnquiryCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    message: str


@router.post("/enquiry", status_code=201)
async def submit_enquiry(body: EnquiryCreate, db: AsyncSession = Depends(get_db)):
    if not body.name.strip() or not body.phone.strip() or not body.message.strip():
        raise HTTPException(status_code=400, detail="Name, phone and message are required.")
    enquiry = Enquiry(
        name=body.name.strip(),
        phone=body.phone.strip(),
        email=body.email.strip() if body.email else None,
        message=body.message.strip(),
    )
    db.add(enquiry)
    await db.commit()
    return {"message": "Enquiry received. We will contact you shortly."}


class ReviewCreate(BaseModel):
    name: str
    role: str
    text: str
    rating: int = 5


@router.post("/reviews", status_code=201)
async def submit_review(body: ReviewCreate, db: AsyncSession = Depends(get_db)):
    if not body.name.strip() or not body.role.strip() or not body.text.strip():
        raise HTTPException(status_code=400, detail="Name, role and review text are required.")
    if not 1 <= body.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
    review = Review(
        name=body.name.strip(),
        role=body.role.strip(),
        text=body.text.strip(),
        rating=body.rating,
        is_approved=False,
    )
    db.add(review)
    await db.commit()
    return {"message": "Thank you for your review. It will appear after approval."}


@router.get("/reviews")
async def get_reviews(db: AsyncSession = Depends(get_db)):
    r = await db.execute(
        select(Review)
        .where(Review.is_approved == True)
        .order_by(Review.created_at.desc())
    )
    return [
        {"id": str(rv.id), "name": rv.name, "role": rv.role,
         "text": rv.text, "rating": rv.rating, "created_at": rv.created_at.isoformat()}
        for rv in r.scalars().all()
    ]
