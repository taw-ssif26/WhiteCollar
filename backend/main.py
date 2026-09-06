import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import create_tables
from models import Admin
from utils.auth import hash_password
from database import AsyncSessionLocal
from sqlalchemy import select

# Routes
from routes.auth import router as auth_router
from routes.admin.students import router as admin_students_router
from routes.admin.results import router as admin_results_router
from routes.admin.invoices import router as admin_invoices_router
from routes.admin.dashboard import router as admin_dashboard_router
from routes.student.portal import router as student_router
from routes.public.content import router as public_router
from services.scheduler import start_scheduler, stop_scheduler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def seed_admin():
    """Create default admin account if none exists."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Admin))
        if result.scalar_one_or_none() is None:
            admin = Admin(
                username="admin",
                password_hash=hash_password(settings.ADMIN_DEFAULT_PASSWORD),
            )
            db.add(admin)
            await db.commit()
            logger.info(f"Default admin created — username: admin, password: {settings.ADMIN_DEFAULT_PASSWORD}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await create_tables()
    await seed_admin()
    start_scheduler()
    logger.info("White-Collar backend started")
    yield
    # Shutdown
    stop_scheduler()


app = FastAPI(
    title="White-Collar English Care API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth_router)
app.include_router(admin_students_router)
app.include_router(admin_results_router)
app.include_router(admin_invoices_router)
app.include_router(admin_dashboard_router)
app.include_router(student_router)
app.include_router(public_router)


@app.get("/")
async def health():
    return {"status": "ok", "service": "White-Collar English Care API"}


# External cron trigger endpoint — ping this from cron-job.org on the 10th
@app.post("/trigger/monthly-reminders")
async def trigger_monthly_reminders():
    from services.scheduler import send_monthly_fee_reminders
    await send_monthly_fee_reminders()
    return {"message": "Monthly reminders triggered"}
