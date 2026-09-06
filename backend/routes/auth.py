from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from database import get_db
from models import Admin, Student
from utils.auth import verify_password, create_token

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str


@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Admin).where(Admin.username == body.username))
    admin = result.scalar_one_or_none()

    if not admin or not verify_password(body.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token = create_token(subject=str(admin.id), role="admin")
    return TokenResponse(access_token=token, role="admin", name=admin.username)


@router.post("/student/login", response_model=TokenResponse)
async def student_login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Student).where(Student.student_id == body.username, Student.is_active == True)
    )
    student = result.scalar_one_or_none()

    if not student or not verify_password(body.password, student.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid student ID or password")

    token = create_token(subject=str(student.id), role="student")
    return TokenResponse(access_token=token, role="student", name=student.name)
