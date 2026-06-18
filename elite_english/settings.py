# elite_english/settings.py
import os
import socket
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Force IPv4 to avoid any potential IPv6 issues
try:
    old_getaddrinfo = socket.getaddrinfo
    def new_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
        return old_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
    socket.getaddrinfo = new_getaddrinfo
except:
    pass

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-your-secret-key-here')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'django_filters',
    'ckeditor',
    'core',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'elite_english.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'elite_english.wsgi.application'

# ============================================
# AIVEN POSTGRESQL DATABASE CONFIGURATION
# ============================================
# Use DATABASE_URL from environment
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    # Parse the URL and configure database
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True
        )
    }
else:
    # Fallback to SQLite for local development without Aiven
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Optional: Add connection pool settings for better performance
# DATABASES['default']['OPTIONS'] = {
#     'connect_timeout': 30,
#     'keepalives': 1,
#     'keepalives_idle': 60,
#     'keepalives_interval': 30,
#     'keepalives_count': 5,
# }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Dhaka'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

# Media files (uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Create media directories if they don't exist
os.makedirs(MEDIA_ROOT, exist_ok=True)
os.makedirs(os.path.join(MEDIA_ROOT, 'gallery'), exist_ok=True)
os.makedirs(os.path.join(MEDIA_ROOT, 'events'), exist_ok=True)
os.makedirs(os.path.join(MEDIA_ROOT, 'achievements'), exist_ok=True)
os.makedirs(os.path.join(MEDIA_ROOT, 'resources'), exist_ok=True)
os.makedirs(os.path.join(MEDIA_ROOT, 'teachers'), exist_ok=True)
os.makedirs(os.path.join(MEDIA_ROOT, 'invoices'), exist_ok=True)

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/dashboard/'
LOGOUT_REDIRECT_URL = '/'

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'https://*.onrender.com',  # For Render deployment
]

# ============================================
# OPTIONAL: AIVEN CONNECTION POOLING
# ============================================
# If you want to use connection pooling (recommended for production)
# Add these to your DATABASES['default']:
# 'ENGINE': 'django.db.backends.postgresql',
# 'NAME': os.getenv('DB_NAME', 'defaultdb'),
# 'USER': os.getenv('DB_USER', 'avnadmin'),
# 'PASSWORD': os.getenv('DB_PASSWORD', ''),
# 'HOST': os.getenv('DB_HOST', ''),
# 'PORT': os.getenv('DB_PORT', '24364'),
# 'OPTIONS': {
#     'sslmode': 'require',
# },

# MIM SMS Settings (Optional)
MIM_SMS_API_KEY = os.getenv('MIM_SMS_API_KEY', '')
MIM_SMS_SENDER_ID = os.getenv('MIM_SMS_SENDER_ID', '')

# Telegram Bot Settings (Optional)
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', '')

# Email Settings (Optional)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
