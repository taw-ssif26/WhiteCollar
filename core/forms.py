# core/forms.py
from django import forms
from django.contrib.auth.models import User
from .models import *

class StudentForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput, 
        required=False,
        help_text="Leave blank to keep current password"
    )
    class_obj = forms.ModelChoiceField(
        queryset=Class.objects.all(),
        required=False,
        empty_label="Select Class"
    )
    
    class Meta:
        model = Student
        fields = ['student_id', 'name', 'email', 'phone', 'guardian_phone', 
                 'class_obj', 'roll', 'school_name']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields['student_id'].widget.attrs['readonly'] = True
    
    def save(self, commit=True):
        student = super().save(commit=False)
        if not hasattr(student, 'user') or not student.user:
            user = User.objects.create_user(
                username=self.cleaned_data['student_id'],
                password=self.cleaned_data.get('password', 'student123')
            )
            student.user = user
        else:
            user = student.user
            user.username = self.cleaned_data['student_id']
            if self.cleaned_data.get('password'):
                user.set_password(self.cleaned_data['password'])
            user.save()
        if commit:
            student.save()
        return student

class ExcelUploadForm(forms.Form):
    excel_file = forms.FileField(label='Select Excel File')

# ... rest of forms remain the same ...
