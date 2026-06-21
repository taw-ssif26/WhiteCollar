# core/utils/sms.py
import requests
from django.conf import settings

def send_sms(phone_number, message):
    """Send SMS using MIM SMS API"""
    try:
        api_key = settings.MIM_SMS_API_KEY
        sender_id = settings.MIM_SMS_SENDER_ID
        
        if not api_key or not sender_id:
            print("SMS credentials not configured")
            return None
        
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
        print(f"SMS Error: {e}")
        return None

def send_bulk_sms(phone_numbers, message):
    """Send SMS to multiple numbers"""
    results = []
    for number in phone_numbers:
        result = send_sms(number, message)
        results.append(result)
    return results

def send_result_sms(student, result):
    """Send result notification via SMS"""
    message = f"""
Dear {student.name},

Your result for {result.exam_name} - {result.subject}:
Marks: {result.marks}/{result.total_marks}
Percentage: {result.percentage}%
Grade: {result.grade}

- White Collar
"""
    return send_sms(student.phone, message)

def send_absent_sms(student, date):
    """Send absence notification via SMS"""
    message = f"""
Dear {student.name},

You were marked absent on {date}.
Please contact the admin if you have any questions.

- White Collar
"""
    return send_sms(student.phone, message)
