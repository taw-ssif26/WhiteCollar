# core/utils/telegram.py
import requests
from django.conf import settings

def send_telegram_message(message, parse_mode='HTML'):
    """Send message to Telegram"""
    try:
        bot_token = settings.TELEGRAM_BOT_TOKEN
        chat_id = settings.TELEGRAM_CHAT_ID
        
        if not bot_token or not chat_id:
            print("Telegram credentials not configured")
            return None
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': parse_mode
        }
        
        response = requests.post(url, data=payload, timeout=10)
        result = response.json()
        
        if result.get('ok'):
            print("✅ Telegram message sent successfully")
            return result
        else:
            print(f"❌ Telegram error: {result.get('description')}")
            return None
            
    except Exception as e:
        print(f"❌ Telegram Error: {e}")
        return None

def send_telegram_photo(photo_url, caption=None):
    """Send photo to Telegram"""
    try:
        bot_token = settings.TELEGRAM_BOT_TOKEN
        chat_id = settings.TELEGRAM_CHAT_ID
        
        if not bot_token or not chat_id:
            return None
        
        url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
        payload = {
            'chat_id': chat_id,
            'photo': photo_url,
            'caption': caption or ''
        }
        
        response = requests.post(url, data=payload, timeout=10)
        return response.json()
        
    except Exception as e:
        print(f"Telegram Error: {e}")
        return None

def send_telegram_document(document_url, caption=None):
    """Send document to Telegram"""
    try:
        bot_token = settings.TELEGRAM_BOT_TOKEN
        chat_id = settings.TELEGRAM_CHAT_ID
        
        if not bot_token or not chat_id:
            return None
        
        url = f"https://api.telegram.org/bot{bot_token}/sendDocument"
        payload = {
            'chat_id': chat_id,
            'document': document_url,
            'caption': caption or ''
        }
        
        response = requests.post(url, data=payload, timeout=10)
        return response.json()
        
    except Exception as e:
        print(f"Telegram Error: {e}")
        return None
