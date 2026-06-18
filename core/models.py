from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from ckeditor.fields import RichTextField

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student')
    student_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    guardian_phone = models.CharField(max_length=15)
    class_name = models.CharField(max_length=50)
    section = models.CharField(max_length=10, blank=True)
    roll = models.CharField(max_length=10)
    school_name = models.CharField(max_length=200)
    admission_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    # Supabase storage reference
    avatar_url = models.URLField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.student_id})"
    
    def get_full_name(self):
        return self.name
    
    class Meta:
        ordering = ['class_name', 'roll']

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

class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=10, choices=[('present', 'Present'), ('absent', 'Absent')])
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.student.name} - {self.date} - {self.status}"
    
    class Meta:
        unique_together = ['student', 'date']

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='invoices')
    month = models.CharField(max_length=20)
    year = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    generated_date = models.DateTimeField(auto_now_add=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    paid_date = models.DateTimeField(null=True, blank=True)
    pdf_file = models.FileField(upload_to='invoices/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.student.name} - {self.month} {self.year}"
    
    class Meta:
        ordering = ['-year', '-month']

class Result(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')
    exam_name = models.CharField(max_length=100)
    subject = models.CharField(max_length=100)
    marks = models.FloatField()
    total_marks = models.FloatField()
    percentage = models.FloatField()
    grade = models.CharField(max_length=5)
    exam_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.student.name} - {self.exam_name} - {self.subject}"
    
    class Meta:
        ordering = ['-exam_date', 'student']

class Event(models.Model):
    EVENT_TYPES = [
        ('upcoming', 'Upcoming'),
        ('completed', 'Completed'),
    ]
    
    title = models.CharField(max_length=200)
    description = RichTextField()
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    event_type = models.CharField(max_length=10, choices=EVENT_TYPES)
    image = models.ImageField(upload_to='events/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['date']

class Achievement(models.Model):
    title = models.CharField(max_length=200)
    description = RichTextField()
    date = models.DateField()
    image = models.ImageField(upload_to='achievements/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-date']

class Gallery(models.Model):
    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to='gallery/')
    description = models.TextField(blank=True)
    uploaded_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-uploaded_date']

class Resource(models.Model):
    FILE_TYPES = [
        ('pdf', 'PDF'),
        ('video', 'Video'),
        ('link', 'Link'),
        ('document', 'Document'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file_type = models.CharField(max_length=10, choices=FILE_TYPES)
    file_upload = models.FileField(upload_to='resources/', null=True, blank=True)
    file_url = models.URLField(null=True, blank=True)
    uploaded_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-uploaded_date']

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher')
    name = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    bio = RichTextField()
    education = RichTextField()
    experience = RichTextField()
    achievements = RichTextField()
    profile_image = models.ImageField(upload_to='teachers/', null=True, blank=True)
    timeline = RichTextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class AboutInfo(models.Model):
    title = models.CharField(max_length=200)
    description = RichTextField()
    mission = RichTextField()
    vision = RichTextField()
    values = RichTextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.email}"
