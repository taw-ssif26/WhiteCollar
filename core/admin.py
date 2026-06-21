# core/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Student

# Unregister default User admin
admin.site.unregister(User)

# Register custom User admin
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff']
    search_fields = ['username', 'email']

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
            'fields': ('password',),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # New student
            # Create user with student_id as username
            user = User.objects.create_user(
                username=obj.student_id,
                password=form.cleaned_data.get('password', 'student123')
            )
            obj.user = user
        else:  # Existing student
            if form.cleaned_data.get('password'):
                obj.user.set_password(form.cleaned_data['password'])
                obj.user.save()
            obj.user.username = obj.student_id
            obj.user.save()
        super().save_model(request, obj, form, change)
