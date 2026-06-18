import requests
from django.conf import settings

def send_sms(phone_number, message):
    """Send SMS using MIM SMS API"""
    try:
        api_key = settings.MIM_SMS_API_KEY
        sender_id = settings.MIM_SMS_SENDER_ID
        
        url = "https://api.mimsms.com/sms/v1/send"
        payload = {
            'api_key': api_key,
            'sender_id': sender_id,
            'to': phone_number,
            'message': message
        }
        
        response = requests.post(url, data=payload)
        return response.json()
    except Exception as e:
        print(f"SMS Error: {e}")
        return None
