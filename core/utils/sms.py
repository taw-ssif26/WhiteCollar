# core/utils/sms.py
import requests
from django.conf import settings

def send_sms(phone_number, message):
    """Send SMS using MIM SMS API"""
    try:
        api_key = settings.MIM_SMS_API_KEY
        sender_id = settings.MIM_SMS_SENDER_ID
        
        if not api_key or not sender_id:
            print(f"⚠️ SMS credentials not configured. Would have sent to {phone_number}: {message[:50]}...")
            return {"success": False, "message": "SMS credentials not configured"}
        
        url = "https://api.mimsms.com/sms/v1/send"
        payload = {
            'api_key': api_key,
            'sender_id': sender_id,
            'to': phone_number,
            'message': message
        }
        
        response = requests.post(url, data=payload, timeout=10)
        result = response.json()
        
        if result.get('success'):
            print(f"✅ SMS sent to {phone_number}")
            return result
        else:
            print(f"❌ SMS failed: {result.get('message')}")
            return None
            
    except Exception as e:
        print(f"❌ SMS Error: {e}")
        return None

def send_bulk_sms(phone_numbers, message):
    """Send SMS to multiple numbers"""
    results = []
    for number in phone_numbers:
        result = send_sms(number, message)
        results.append(result)
    return results
