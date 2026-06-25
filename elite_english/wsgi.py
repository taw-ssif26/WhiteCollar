# elite_english/wsgi.py
import os
from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elite_english.settings')

application = get_wsgi_application()
application = WhiteNoise(application)
