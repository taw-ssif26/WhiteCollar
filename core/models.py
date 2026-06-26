# core/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from ckeditor.fields import RichTextField

class Class(models.Model):
    name = models.CharField(max_length=50)
    section = models.CharField(max_length=10)
    description = models.TextField(blank=True)
    schedule = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.section}"
    
    class Meta:
        unique_together = ['name', 'section']
        ordering = ['name', 'section']

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student')
    student_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    guardian_phone = models.CharField(max_length=15)
    class_obj = models.ForeignKey(Class, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    class_name = models.CharField(max_length=50, blank=True)  # For backward compatibility
    section = models.CharField(max_length=10, blank=True)
    roll = models.CharField(max_length=10)
    school_name = models.CharField(max_length=200)
    admission_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.student_id})"
    
    def save(self, *args, **kwargs):
        if self.class_obj:
            self.class_name = self.class_obj.name
            self.section = self.class_obj.section
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['class_name', 'roll']

class Routine(models.Model):
    DAYS_OF_WEEK = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    ]
    
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='routines')
    day = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    subject = models.CharField(max_length=100)
    topic = models.CharField(max_length=200, blank=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.class_obj.name} - {self.day} - {self.subject}"
    
    class Meta:
        ordering = ['class_obj', 'day', 'start_time']

# ... rest of models remain the same ...
