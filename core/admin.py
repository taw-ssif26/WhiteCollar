from django.contrib import admin
from .models import *

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'name', 'class_name', 'roll', 'phone']
    search_fields = ['student_id', 'name', 'email']
    list_filter = ['class_name', 'section']

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'event_type', 'location']
    list_filter = ['event_type']

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['title', 'date']

@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ['title', 'uploaded_date']

@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ['student', 'exam_name', 'subject', 'percentage', 'grade']

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['student', 'month', 'year', 'amount', 'status']
    list_filter = ['status', 'month']

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'date', 'status']
    list_filter = ['status', 'date']

@admin.register(Routine)
class RoutineAdmin(admin.ModelAdmin):
    list_display = ['class_obj', 'day', 'subject', 'start_time', 'end_time']
    list_filter = ['class_obj', 'day']

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'file_type', 'uploaded_date']
    list_filter = ['file_type']
