# core/forms.py
from django import forms
from django.contrib.auth.models import User
from .models import Student

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
