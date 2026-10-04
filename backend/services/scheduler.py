import logging
from datetime import datetime, date
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select
from database import AsyncSessionLocal
from models import Invoice, Student
from services.whatsapp import send_whatsapp, build_fee_reminder_message, build_invoice_message

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def send_monthly_fee_reminders():
    """
    Runs on the 1st of every month at 9 AM.
    For every active student that has a monthly_fee set:
      1. Auto-creates an invoice for that month (if not already created).
      2. Sends a WhatsApp notification about the new invoice.
    Then also sends reminders for any previously unpaid invoices.
    """
    logger.info("Running 1st-of-month job: auto-invoices + reminders...")
    now = datetime.now()
    month_label = now.strftime("%B %Y")
    issue_date = date(now.year, now.month, 1)
    # Due date: 15th of same month
    due_date = date(now.year, now.month, 15)

    async with AsyncSessionLocal() as db:
        # --- Step 1: Auto-create monthly invoices for students with a set fee ---
        result = await db.execute(
            select(Student).where(Student.is_active == True, Student.monthly_fee != None)
        )
        students = result.scalars().all()

        for student in students:
            # Check if invoice already exists for this month
            existing = await db.execute(
                select(Invoice).where(
                    Invoice.student_id == student.id,
                    Invoice.description.contains(month_label),
                )
            )
            if existing.scalar_one_or_none():
                continue  # already created this month

            # Generate invoice number
            from sqlalchemy import func
            count_result = await db.execute(select(func.count()).select_from(Invoice))
            count = count_result.scalar()
            invoice_number = f"INV-{now.year}{str(now.month).zfill(2)}-{str(count + 1).zfill(4)}"

            invoice = Invoice(
                student_id=student.id,
                invoice_number=invoice_number,
                amount=student.monthly_fee,
                description=f"Monthly tuition fee — {month_label}",
                issue_date=issue_date,
                due_date=due_date,
            )
            db.add(invoice)
            await db.commit()
            await db.refresh(invoice)

            # Send WhatsApp notification about new invoice
            message = build_invoice_message(
                student_name=student.name,
                invoice_number=invoice_number,
                amount=float(student.monthly_fee),
                description=f"Monthly tuition fee — {month_label}",
                due_date=str(due_date),
            )
            sent = await send_whatsapp(student.whatsapp_number, message)
            invoice.whatsapp_sent = sent
            await db.commit()
            logger.info(f"Auto-invoice created for {student.name}: {invoice_number}")

        # --- Step 2: Remind about all unpaid invoices (including old ones) ---
        unpaid_result = await db.execute(
            select(Invoice, Student)
            .join(Student, Invoice.student_id == Student.id)
            .where(Invoice.is_paid == False, Student.is_active == True)
        )
        unpaid_rows = unpaid_result.all()

        reminded = 0
        for invoice, student in unpaid_rows:
            message = build_fee_reminder_message(
                student_name=student.name,
                invoice_number=invoice.invoice_number,
                amount=float(invoice.amount),
                due_date=str(invoice.due_date),
            )
            success = await send_whatsapp(student.whatsapp_number, message)
            if success:
                reminded += 1

        logger.info(f"Reminders sent: {reminded}/{len(unpaid_rows)}")


def start_scheduler():
    scheduler.add_job(
        send_monthly_fee_reminders,
        CronTrigger(day=1, hour=9, minute=0),  # 1st of every month, 9 AM
        id="monthly_fee_job",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started — monthly job runs on the 1st at 9 AM")


def stop_scheduler():
    scheduler.shutdown()
