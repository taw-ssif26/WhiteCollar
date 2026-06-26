# core/admin.py
from django.contrib import admin
from django.utils import timezone
from .models import *

# Student Admin
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'name', 'class_name', 'roll', 'phone']
    search_fields = ['student_id', 'name', 'email']
    list_filter = ['class_name', 'section']
    fieldsets = (
        ('Student Information', {
            'fields': ('student_id', 'name', 'email', 'phone', 'guardian_phone')
        }),
        ('Academic Information', {
            'fields': ('class_name', 'section', 'roll', 'school_name')
        }),
        ('Account Information', {
            'fields': ('is_active',),
            'classes': ('collapse',)
        }),
    )

# Event Admin
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'event_type', 'location']
    list_filter = ['event_type']
    search_fields = ['title', 'location']

# Achievement Admin
@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['title', 'date']
    search_fields = ['title']

# Gallery Admin
@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ['title', 'uploaded_date']
    search_fields = ['title']

# Result Admin
@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ['student', 'exam_name', 'subject', 'percentage', 'grade']
    list_filter = ['exam_name', 'grade']
    search_fields = ['student__name', 'student__student_id']

# Invoice Admin
@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['student', 'month', 'year', 'amount', 'status', 'generated_date']
    list_filter = ['status', 'month', 'year']
    search_fields = ['student__name', 'student__student_id']
    readonly_fields = ['generated_date', 'approved_date', 'paid_date']
    fieldsets = (
        ('Student Information', {
            'fields': ('student',)
        }),
        ('Invoice Details', {
            'fields': ('month', 'year', 'amount', 'description')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('generated_date', 'approved_date', 'paid_date'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.generated_date = timezone.now()
        super().save_model(request, obj, form, change)

# Attendance Admin
@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'date', 'status']
    list_filter = ['status', 'date']
    search_fields = ['student__name']

# Routine Admin
@admin.register(Routine)
class RoutineAdmin(admin.ModelAdmin):
    list_display = ['class_obj', 'day', 'subject', 'start_time', 'end_time']
    list_filter = ['class_obj', 'day']

# Resource Admin
@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'file_type', 'uploaded_date']
    list_filter = ['file_type']

# Teacher Admin
@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['name', 'designation']
    search_fields = ['name']

# AboutInfo Admin
@admin.register(AboutInfo)
class AboutInfoAdmin(admin.ModelAdmin):
    list_display = ['title', 'updated_at']

# Contact Admin
@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'email']

# Class Admin - ✅ ADD THIS
@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ['name', 'section']
    search_fields = ['name', 'section']
