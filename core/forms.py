# core/forms.py
from django import forms
from django.contrib.auth.models import User
from .models import Student, Event, Gallery, Result, Achievement, Contact, Routine, Resource

class StudentForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput, 
        required=False,
        help_text="Leave blank to keep current password"
    )
    
    class Meta:
        model = Student
        fields = ['student_id', 'name', 'email', 'phone', 'guardian_phone', 
                 'class_name', 'section', 'roll', 'school_name']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            # Editing existing student
            self.fields['student_id'].widget.attrs['readonly'] = True
    
    def save(self, commit=True):
        student = super().save(commit=False)
        
        # Check if student has a user account
        if not hasattr(student, 'user') or not student.user:
            # Create new user with student_id as username
            user = User.objects.create_user(
                username=self.cleaned_data['student_id'],
                password=self.cleaned_data.get('password', 'student123')
            )
            student.user = user
        else:
            # Update existing user
            user = student.user
            user.username = self.cleaned_data['student_id']
            if self.cleaned_data.get('password'):
                user.set_password(self.cleaned_data['password'])
            user.save()
        
        if commit:
            student.save()
        return student


# ============================================
# ADD ALL THESE FORMS
# ============================================

class EventForm(forms.ModelForm):
    class Meta:
        model = Event
        fields = ['title', 'description', 'date', 'location', 'event_type', 'image']
        widgets = {
            'date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'description': forms.Textarea(attrs={'rows': 5}),
        }

class GalleryForm(forms.ModelForm):
    class Meta:
        model = Gallery
        fields = ['title', 'image', 'description']

class ResultForm(forms.ModelForm):
    class Meta:
        model = Result
        fields = ['student', 'exam_name', 'subject', 'marks', 'total_marks', 'exam_date']
        widgets = {
            'exam_date': forms.DateInput(attrs={'type': 'date'}),
        }

class ExcelUploadForm(forms.Form):
    excel_file = forms.FileField()

class AchievementForm(forms.ModelForm):
    class Meta:
        model = Achievement
        fields = ['title', 'description', 'date', 'image']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
            'description': forms.Textarea(attrs={'rows': 5}),
        }

class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = ['name', 'email', 'phone', 'message']
        widgets = {
            'message': forms.Textarea(attrs={'rows': 4}),
        }

class AdmissionForm(forms.Form):
    name = forms.CharField(max_length=100)
    class_name = forms.CharField(max_length=50)
    roll = forms.CharField(max_length=10, required=False)
    email = forms.EmailField()
    phone = forms.CharField(max_length=15)
    guardian_phone = forms.CharField(max_length=15)
    school_name = forms.CharField(max_length=200)
    heard_from = forms.ChoiceField(choices=[
        ('', 'Select an option'),
        ('social_media', 'Social Media'),
        ('alumni', 'Alumni Recommendation'),
        ('event', 'Event'),
        ('online', 'Online Advertisement'),
        ('other', 'Other'),
    ])

class RoutineForm(forms.ModelForm):
    class Meta:
        model = Routine
        fields = ['class_obj', 'day', 'subject', 'topic', 'start_time', 'end_time']
        widgets = {
            'start_time': forms.TimeInput(attrs={'type': 'time'}),
            'end_time': forms.TimeInput(attrs={'type': 'time'}),
        }

# ✅ ResourceForm - ADD THIS
class ResourceForm(forms.ModelForm):
    class Meta:
        model = Resource
        fields = ['title', 'description', 'file_type', 'file_upload', 'file_url']
