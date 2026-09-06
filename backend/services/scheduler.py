import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select
from database import AsyncSessionLocal
from models import Invoice, Student
from services.whatsapp import send_whatsapp, build_fee_reminder_message

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def send_monthly_fee_reminders():
    """
    Runs on the 10th of every month.
    Sends WhatsApp reminders to all students with unpaid invoices.
    """
    logger.info("Running monthly fee reminder job...")
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Invoice, Student)
            .join(Student, Invoice.student_id == Student.id)
            .where(Invoice.is_paid == False, Student.is_active == True)
        )
        rows = result.all()

    if not rows:
        logger.info("No unpaid invoices found.")
        return

    sent_count = 0
    for invoice, student in rows:
        message = build_fee_reminder_message(
            student_name=student.name,
            invoice_number=invoice.invoice_number,
            amount=float(invoice.amount),
            due_date=str(invoice.due_date),
        )
        success = await send_whatsapp(student.whatsapp_number, message)
        if success:
            sent_count += 1

    logger.info(f"Monthly reminders sent: {sent_count}/{len(rows)}")


def start_scheduler():
    """Start the APScheduler. Called once on app startup."""
    scheduler.add_job(
        send_monthly_fee_reminders,
        CronTrigger(day=10, hour=9, minute=0),  # 10th of month, 9 AM
        id="monthly_fee_reminder",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started — fee reminders scheduled for 10th of each month at 9 AM")


def stop_scheduler():
    scheduler.shutdown()
