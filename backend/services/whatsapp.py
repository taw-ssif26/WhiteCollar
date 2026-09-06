import httpx
import logging
from config import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://api.green-api.com"


def _format_number(number: str) -> str:
    """Ensure number is in international format without + sign."""
    number = number.strip().replace("+", "").replace(" ", "").replace("-", "")
    # If Bangladeshi number without country code, prepend 880
    if number.startswith("01") and len(number) == 11:
        number = "880" + number[1:]
    return number + "@c.us"


async def send_whatsapp(phone_number: str, message: str) -> bool:
    """Send a WhatsApp message. Returns True on success."""
    if not settings.GREEN_API_INSTANCE_ID or not settings.GREEN_API_TOKEN:
        logger.warning("WhatsApp not configured — message not sent")
        return False

    url = (
        f"{BASE_URL}/waInstance{settings.GREEN_API_INSTANCE_ID}"
        f"/sendMessage/{settings.GREEN_API_TOKEN}"
    )
    payload = {
        "chatId": _format_number(phone_number),
        "message": message,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            logger.info(f"WhatsApp sent to {phone_number}")
            return True
    except Exception as e:
        logger.error(f"WhatsApp send failed for {phone_number}: {e}")
        return False


def build_result_message(student_name: str, exam_name: str, obtained: int, total: int, exam_date: str, remarks: str | None) -> str:
    percentage = round((obtained / total) * 100, 1) if total > 0 else 0
    grade = _get_grade(percentage)
    msg = (
        f"📊 *White-Collar English Care*\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"Result Update for *{student_name}*\n\n"
        f"📝 Exam: {exam_name}\n"
        f"📅 Date: {exam_date}\n"
        f"✅ Marks: {obtained} / {total}\n"
        f"📈 Percentage: {percentage}%\n"
        f"🏅 Grade: {grade}\n"
    )
    if remarks:
        msg += f"\n💬 Remarks: {remarks}\n"
    msg += "\nFor any queries, please contact your instructor."
    return msg


def build_invoice_message(student_name: str, invoice_number: str, amount: float, description: str, due_date: str) -> str:
    return (
        f"🧾 *White-Collar English Care*\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"Invoice for *{student_name}*\n\n"
        f"🔢 Invoice #: {invoice_number}\n"
        f"💰 Amount: ৳{amount:,.0f}\n"
        f"📋 Description: {description}\n"
        f"📅 Due Date: {due_date}\n\n"
        f"Please complete your payment to continue classes.\n"
        f"Thank you! 🙏"
    )


def build_fee_reminder_message(student_name: str, invoice_number: str, amount: float, due_date: str) -> str:
    return (
        f"⚠️ *White-Collar English Care*\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"Fee Reminder for *{student_name}*\n\n"
        f"Your fee is still unpaid.\n"
        f"🔢 Invoice #: {invoice_number}\n"
        f"💰 Amount Due: ৳{amount:,.0f}\n"
        f"📅 Due Date: {due_date}\n\n"
        f"Please pay at your earliest convenience to avoid any disruption to your classes."
    )


def _get_grade(percentage: float) -> str:
    if percentage >= 90:
        return "A+ (Excellent)"
    elif percentage >= 80:
        return "A (Very Good)"
    elif percentage >= 70:
        return "B (Good)"
    elif percentage >= 60:
        return "C (Average)"
    elif percentage >= 50:
        return "D (Below Average)"
    else:
        return "F (Fail)"
