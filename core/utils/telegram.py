import requests
from django.conf import settings

def send_telegram_message(message):
    """Send message to Telegram"""
    try:
        bot_token = settings.TELEGRAM_BOT_TOKEN
        chat_id = settings.TELEGRAM_CHAT_ID
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }
        
        response = requests.post(url, data=payload)
        return response.json()
    except Exception as e:
        print(f"Telegram Error: {e}")
        return None
