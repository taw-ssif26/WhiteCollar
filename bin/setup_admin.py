# bin/setup_admin.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elite_english.settings')
django.setup()

from django.contrib.auth.models import User

# Create superuser if it doesn't exist
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@eliteenglish.com',
        password='admin123'  # CHANGE THIS!
    )
    print("✅ Superuser created: admin / admin123")
else:
    print("ℹ️ Superuser already exists")
