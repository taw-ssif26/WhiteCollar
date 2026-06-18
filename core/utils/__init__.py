# core/utils/__init__.py
# ❌ REMOVE: from .supabase_client import get_supabase_client, get_supabase_service_client
# ✅ Just keep other utilities if any
from .sms import send_sms
from .telegram import send_telegram_message
from .invoice_generator import generate_invoice_pdf
from .excel_parser import parse_excel_results
