# core/views.py
# core/views.py - At the very top
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from datetime import datetime
import json
import os
from .models import *
from .forms import *  # ← MAKE SURE THIS LINE EXISTS
def is_admin(user):
    return user.is_superuser or user.is_staff

# ============================================
# PUBLIC VIEWS
# ============================================

def front_page(request):
    events = Event.objects.filter(event_type='upcoming')[:3]
    achievements = Achievement.objects.all()[:3]
    gallery = Gallery.objects.all()[:6]
    results = Result.objects.all().order_by('-percentage')[:3]
    return render(request, 'core/front_page.html', {
        'events': events,
        'achievements': achievements,
        'gallery': gallery,
        'results': results,
    })

def login_view(request):
    if request.user.is_authenticated:
        if request.user.is_superuser or request.user.is_staff:
            return redirect('admin_dashboard')
        elif hasattr(request.user, 'student'):
            return redirect('student_dashboard')

    if request.method == 'POST':
        student_id = request.POST.get('student_id')
        password = request.POST.get('password')

        user = authenticate(request, username=student_id, password=password)
        if user is not None:
            login(request, user)
            if user.is_superuser or user.is_staff:
                return redirect('admin_dashboard')
            elif hasattr(user, 'student'):
                return redirect('student_dashboard')

        try:
            student = Student.objects.get(student_id=student_id)
            user = student.user
            if user.check_password(password):
                login(request, user)
                return redirect('student_dashboard')
        except Student.DoesNotExist:
            pass

        messages.error(request, 'Invalid Student ID or Password')

    return render(request, 'core/login.html')

def logout_view(request):
    logout(request)
    return redirect('front_page')

def events_view(request):
    upcoming = Event.objects.filter(event_type='upcoming').order_by('date')
    completed = Event.objects.filter(event_type='completed').order_by('-date')
    return render(request, 'core/events.html', {'upcoming': upcoming, 'completed': completed})

def gallery_view(request):
    images = Gallery.objects.all()
    return render(request, 'core/gallery.html', {'images': images})

def results_view(request):
    top_results = Result.objects.all().order_by('-percentage')[:3]
    all_results = Result.objects.all().order_by('-exam_date', '-percentage')
    return render(request, 'core/results.html', {'top_results': top_results, 'all_results': all_results})

def achievements_view(request):
    achievements = Achievement.objects.all()
    return render(request, 'core/achievements.html', {'achievements': achievements})

def teacher_view(request):
    try:
        teacher = Teacher.objects.first()
    except:
        teacher = None
    return render(request, 'core/teacher.html', {'teacher': teacher})

def about_view(request):
    about = AboutInfo.objects.first()
    return render(request, 'core/about.html', {'about': about})

def contact_view(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your message has been sent successfully!')
            return redirect('contact_view')
    else:
        form = ContactForm()
    return render(request, 'core/contact.html', {'form': form})

def admission_view(request):
    if request.method == 'POST':
        form = AdmissionForm(request.POST)
        if form.is_valid():
            try:
                from .utils.telegram import send_telegram_message
                message = f"""
🎓 New Admission Request

Name: {form.cleaned_data['name']}
Class: {form.cleaned_data['class_name']}
School Roll: {form.cleaned_data['roll']}
Email: {form.cleaned_data['email']}
Contact: {form.cleaned_data['phone']}
Guardian: {form.cleaned_data['guardian_phone']}
School: {form.cleaned_data['school_name']}
Heard From: {form.cleaned_data['heard_from']}
                """
                send_telegram_message(message)
            except Exception:
                pass

            messages.success(request, 'Admission request submitted successfully! We will contact you soon.')
            return redirect('admission_view')
    else:
        form = AdmissionForm()
    return render(request, 'core/admission.html', {'form': form})

# ============================================
# STUDENT DASHBOARD VIEWS
# ============================================

@login_required
def student_dashboard(request):
    if not hasattr(request.user, 'student'):
        return redirect('front_page')

    student = request.user.student

    all_attendances = student.attendances.all()
    total_days = all_attendances.count()
    present_days = all_attendances.filter(status='present').count()
    attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0

    attendances = all_attendances[:10]
    results = student.results.all().order_by('-exam_date')[:5]
    invoices = student.invoices.all().order_by('-generated_date')[:5]
    routine = Routine.objects.filter(class_obj__name=student.class_name)

    graph_results = student.results.all().order_by('exam_date')[:10]
    exam_names = []
    exam_data = []
    for result in graph_results:
        exam_names.append(result.exam_name)
        exam_data.append(result.percentage)

    context = {
        'student': student,
        'attendances': attendances,
        'results': results,
        'invoices': invoices,
        'routine': routine,
        'attendance_percentage': attendance_percentage,
        'exam_names': json.dumps(exam_names),
        'exam_data': json.dumps(exam_data),
    }
    return render(request, 'core/student_dashboard.html', context)

@login_required
def update_profile(request):
    if not hasattr(request.user, 'student'):
        return redirect('front_page')

    student = request.user.student
    if request.method == 'POST':
        student.name = request.POST.get('name', student.name)
        student.email = request.POST.get('email', student.email)
        student.phone = request.POST.get('phone', student.phone)
        student.guardian_phone = request.POST.get('guardian_phone', student.guardian_phone)
        student.save()
        messages.success(request, 'Profile updated successfully!')
        return redirect('student_dashboard')
    return redirect('student_dashboard')

@login_required
def routine_view(request):
    if request.user.is_superuser or request.user.is_staff:
        routines = Routine.objects.all().order_by('class_obj', 'day', 'start_time')
        return render(request, 'core/routine_admin.html', {'routines': routines})
    else:
        student = request.user.student
        routines = Routine.objects.filter(class_obj__name=student.class_name)
        return render(request, 'core/routine.html', {'routines': routines})

@login_required
def invoice_request(request):
    if request.method == 'POST':
        student = request.user.student
        month = request.POST.get('month')
        year = request.POST.get('year')
        amount = request.POST.get('amount', '1500')
        description = request.POST.get('description', 'Monthly Tuition Fee')

        try:
            amount = float(amount)
            if amount <= 0:
                messages.error(request, 'Amount must be greater than 0')
                return redirect('invoice_request')
        except ValueError:
            messages.error(request, 'Please enter a valid amount')
            return redirect('invoice_request')

        existing = Invoice.objects.filter(
            student=student,
            month=month,
            year=year
        ).first()

        if existing:
            messages.warning(request, 'Invoice already exists for this month')
            return redirect('student_dashboard')

        Invoice.objects.create(
            student=student,
            month=month,
            year=year,
            amount=amount,
            description=description
        )
        messages.success(request, f'Invoice for BDT {amount} requested successfully! Waiting for admin approval.')
        return redirect('student_dashboard')

    return render(request, 'core/invoice_request.html')

@login_required
def resources_view(request):
    resources = Resource.objects.all()
    return render(request, 'core/resources.html', {'resources': resources})

# ============================================
# INVOICE VIEWS
# ============================================

@login_required
def invoice_download(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)

    if hasattr(request.user, 'student'):
        if request.user.student != invoice.student and not request.user.is_superuser:
            messages.error(request, 'You are not authorized to view this invoice')
            return redirect('student_dashboard')

    if not invoice.pdf_file:
        messages.error(request, 'PDF not generated yet. Please contact admin.')
        return redirect('student_dashboard')

    from django.conf import settings
    file_path = os.path.join(settings.MEDIA_ROOT, str(invoice.pdf_file))

    if not os.path.exists(file_path):
        messages.error(request, 'PDF file not found. Please contact admin.')
        return redirect('student_dashboard')

    with open(file_path, 'rb') as f:
        response = HttpResponse(f.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename=invoice_{invoice.id}.pdf'
        return response

# ============================================
# PROGRESS REPORT VIEWS
# ============================================

@login_required
def download_progress_report(request):
    if not hasattr(request.user, 'student'):
        messages.error(request, 'Student profile not found')
        return redirect('front_page')

    student = request.user.student

    try:
        from .utils.progress_reports import generate_progress_report
        filepath = generate_progress_report(student)

        with open(filepath, 'rb') as f:
            response = HttpResponse(f.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename=progress_{student.student_id}.pdf'
            return response
    except Exception as e:
        messages.error(request, f'Error generating report: {str(e)}')
        return redirect('student_dashboard')

# ============================================
# ATTENDANCE VIEWS
# ============================================

@login_required
def attendance_view(request):
    if not hasattr(request.user, 'student'):
        return redirect('front_page')

    student = request.user.student
    attendances = student.attendances.all().order_by('-date')

    current_month = timezone.now().month
    current_year = timezone.now().year

    total_days = attendances.count()
    present_days = attendances.filter(status='present').count()
    absent_days = attendances.filter(status='absent').count()

    summary = {
        'total': total_days,
        'present': present_days,
        'absent': absent_days,
        'percentage': (present_days / total_days * 100) if total_days > 0 else 0
    }

    context = {
        'attendances': attendances,
        'summary': summary,
        'student': student,
    }
    return render(request, 'core/attendance_view.html', context)

@user_passes_test(is_admin)
def attendance_history(request, student_id=None):
    if student_id:
        student = get_object_or_404(Student, id=student_id)
        attendances = student.attendances.all().order_by('-date')
    else:
        attendances = Attendance.objects.all().order_by('-date')
        student = None

    return render(request, 'core/attendance_history.html', {
        'attendances': attendances,
        'student': student,
    })

# ============================================
# ATTENDANCE MANAGEMENT (Admin)
# ============================================

# core/views.py - Complete attendance_manage function

@user_passes_test(is_admin)
def attendance_manage(request):
    if request.method == 'POST':
        date = request.POST.get('date')
        class_name = request.POST.get('class_name')
        
        if not date or not class_name:
            messages.error(request, 'Please select date and class')
            return redirect('attendance_manage')
        
        students = Student.objects.filter(class_name=class_name)
        
        if not students.exists():
            messages.warning(request, 'No students found in this class')
            return redirect('attendance_manage')
        
        absent_students = []
        present_students = []
        
        for student in students:
            is_absent = request.POST.get(f'absent_{student.id}') == str(student.id)
            
            if is_absent:
                absent_students.append(student)
                Attendance.objects.update_or_create(
                    student=student,
                    date=date,
                    defaults={'status': 'absent', 'remarks': 'Marked absent by admin'}
                )
            else:
                present_students.append(student)
                Attendance.objects.update_or_create(
                    student=student,
                    date=date,
                    defaults={'status': 'present', 'remarks': ''}
                )
        
        sms_sent_count = 0
        sms_errors = []
        if request.POST.get('send_sms') == 'on' and absent_students:
            try:
                from .utils.sms import send_sms
                for student in absent_students:
                    message = f"""
🏫 White Collar - Attendance Alert

Dear {student.name},

You were marked ABSENT on {date}.
Please contact the admin if you have any questions.

📞 Contact: +880 1234 567890
📍 White Collar Academy
"""
                    result = send_sms(student.phone, message)
                    if result and result.get('success'):
                        sms_sent_count += 1
                    else:
                        sms_errors.append(student.name)
            except Exception as e:
                print(f"SMS Error: {e}")
                messages.warning(request, 'SMS service is not configured properly.')
        
        messages.success(request, f'✅ Attendance marked for {len(students)} students!')
        messages.info(request, f'📋 Present: {len(present_students)} | Absent: {len(absent_students)}')
        
        if sms_sent_count > 0:
            messages.success(request, f'📱 SMS sent to {sms_sent_count} absent students')
        if sms_errors:
            messages.warning(request, f'⚠️ SMS failed for: {", ".join(sms_errors)}')
        
        return redirect('attendance_manage')
    
    classes = Class.objects.all()
    today = timezone.now().date()
    
    context = {
        'classes': classes,
        'today': today,
    }
    return render(request, 'core/attendance.html', context)

# ============================================
# ADMIN VIEWS
# ============================================

# core/views.py - admin_dashboard function

@user_passes_test(is_admin)
def admin_dashboard(request):
    context = {
        'total_students': Student.objects.count(),
        'total_events': Event.objects.count(),
        'pending_invoices': Invoice.objects.filter(status='pending').count(),
        'absent_today': Attendance.objects.filter(date=timezone.now().date(), status='absent').count(),
        'recent_students': Student.objects.all().order_by('-admission_date')[:10],
        'recent_events': Event.objects.all().order_by('-date')[:5],
        'recent_invoices': Invoice.objects.filter(status='pending').order_by('-generated_date')[:10],
    }
    return render(request, 'core/admin_dashboard.html', context)
# ============================================
# STUDENT MANAGEMENT (Admin)
# ============================================

@user_passes_test(is_admin)
def student_list(request):
    students = Student.objects.all().order_by('class_name', 'roll')
    return render(request, 'core/student_list.html', {'students': students})

@user_passes_test(is_admin)
def student_add(request):
    if request.method == 'POST':
        form = StudentForm(request.POST)
        if form.is_valid():
            student = form.save()
            messages.success(request, f'Student {student.name} added successfully!')
            return redirect('student_list')
    else:
        form = StudentForm()
    return render(request, 'core/student_form.html', {'form': form, 'title': 'Add Student'})

@user_passes_test(is_admin)
def student_edit(request, pk):
    student = get_object_or_404(Student, pk=pk)
    if request.method == 'POST':
        form = StudentForm(request.POST, instance=student)
        if form.is_valid():
            form.save()
            messages.success(request, f'Student {student.name} updated successfully!')
            return redirect('student_list')
    else:
        form = StudentForm(instance=student)
    return render(request, 'core/student_form.html', {'form': form, 'title': 'Edit Student'})

@user_passes_test(is_admin)
def student_delete(request, pk):
    student = get_object_or_404(Student, pk=pk)
    if request.method == 'POST':
        name = student.name
        student.delete()
        messages.success(request, f'Student {name} deleted successfully!')
        return redirect('student_list')
    return render(request, 'core/confirm_delete.html', {'object': student, 'type': 'Student'})

# ============================================
# EVENT MANAGEMENT (Admin)
# ============================================

@user_passes_test(is_admin)
def event_add(request):
    if request.method == 'POST':
        form = EventForm(request.POST, request.FILES)
        if form.is_valid():
            event = form.save()
            messages.success(request, f'Event {event.title} added successfully!')
            return redirect('events_view')
    else:
        form = EventForm()
    return render(request, 'core/event_form.html', {'form': form, 'title': 'Add Event'})

@user_passes_test(is_admin)
def event_edit(request, pk):
    event = get_object_or_404(Event, pk=pk)
    if request.method == 'POST':
        form = EventForm(request.POST, request.FILES, instance=event)
        if form.is_valid():
            form.save()
            messages.success(request, f'Event {event.title} updated successfully!')
            return redirect('events_view')
    else:
        form = EventForm(instance=event)
    return render(request, 'core/event_form.html', {'form': form, 'title': 'Edit Event'})

@user_passes_test(is_admin)
def event_delete(request, pk):
    event = get_object_or_404(Event, pk=pk)
    if request.method == 'POST':
        title = event.title
        event.delete()
        messages.success(request, f'Event {title} deleted successfully!')
        return redirect('events_view')
    return render(request, 'core/confirm_delete.html', {'object': event, 'type': 'Event'})

# ============================================
# GALLERY MANAGEMENT (Admin)
# ============================================

@user_passes_test(is_admin)
def gallery_add(request):
    if request.method == 'POST':
        form = GalleryForm(request.POST, request.FILES)
        if form.is_valid():
            gallery = form.save()
            messages.success(request, f'Image {gallery.title} added successfully!')
            return redirect('gallery_view')
    else:
        form = GalleryForm()
    return render(request, 'core/gallery_form.html', {'form': form, 'title': 'Add Image'})

@user_passes_test(is_admin)
def gallery_delete(request, pk):
    gallery = get_object_or_404(Gallery, pk=pk)
    if request.method == 'POST':
        title = gallery.title
        gallery.delete()
        messages.success(request, f'Image {title} deleted successfully!')
        return redirect('gallery_view')
    return render(request, 'core/confirm_delete.html', {'object': gallery, 'type': 'Image'})

# ============================================
# RESULT MANAGEMENT (Admin)
# ============================================

@user_passes_test(is_admin)
def result_add(request):
    if request.method == 'POST':
        form = ResultForm(request.POST)
        if form.is_valid():
            result = form.save()
            messages.success(request, f'Result added successfully!')
            return redirect('results_view')
    else:
        form = ResultForm()
    return render(request, 'core/result_form.html', {'form': form, 'title': 'Add Result'})

@user_passes_test(is_admin)
def result_upload_excel(request):
    if request.method == 'POST':
        form = ExcelUploadForm(request.POST, request.FILES)
        if form.is_valid():
            messages.success(request, 'Excel file uploaded successfully!')
            return redirect('results_view')
    else:
        form = ExcelUploadForm()
    return render(request, 'core/result_upload.html', {'form': form})

# ============================================
# ACHIEVEMENT MANAGEMENT (Admin)
# ============================================

@user_passes_test(is_admin)
def achievement_add(request):
    if request.method == 'POST':
        form = AchievementForm(request.POST, request.FILES)
        if form.is_valid():
            achievement = form.save()
            messages.success(request, f'Achievement {achievement.title} added successfully!')
            return redirect('achievements_view')
    else:
        form = AchievementForm()
    return render(request, 'core/achievement_form.html', {'form': form, 'title': 'Add Achievement'})

@user_passes_test(is_admin)
def achievement_edit(request, pk):
    achievement = get_object_or_404(Achievement, pk=pk)
    if request.method == 'POST':
        form = AchievementForm(request.POST, request.FILES, instance=achievement)
        if form.is_valid():
            form.save()
            messages.success(request, f'Achievement {achievement.title} updated successfully!')
            return redirect('achievements_view')
    else:
        form = AchievementForm(instance=achievement)
    return render(request, 'core/achievement_form.html', {'form': form, 'title': 'Edit Achievement'})

@user_passes_test(is_admin)
def achievement_delete(request, pk):
    achievement = get_object_or_404(Achievement, pk=pk)
    if request.method == 'POST':
        title = achievement.title
        achievement.delete()
        messages.success(request, f'Achievement {title} deleted successfully!')
        return redirect('achievements_view')
    return render(request, 'core/confirm_delete.html', {'object': achievement, 'type': 'Achievement'})

# ============================================
# INVOICE MANAGEMENT (Admin)
# ============================================

@user_passes_test(is_admin)
def invoice_manage(request):
    invoices = Invoice.objects.all().order_by('-generated_date')
    total_amount = sum(i.amount for i in invoices)
    pending_count = invoices.filter(status='pending').count()
    approved_count = invoices.filter(status='approved').count()
    paid_count = invoices.filter(status='paid').count()

    context = {
        'invoices': invoices,
        'total_amount': total_amount,
        'pending_count': pending_count,
        'approved_count': approved_count,
        'paid_count': paid_count,
    }
    return render(request, 'core/invoice_manage.html', context)

@user_passes_test(is_admin)
def invoice_approve(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)
    invoice.status = 'approved'
    invoice.approved_date = timezone.now()
    invoice.save()

    try:
        from .utils.invoice_generator import generate_invoice_pdf
        pdf_path = generate_invoice_pdf(invoice)
        invoice.pdf_file = pdf_path
        invoice.save()
        messages.success(request, f'Invoice approved and PDF generated for {invoice.student.name}')
    except Exception as e:
        messages.error(request, f'Invoice approved but PDF generation failed: {str(e)}')

    return redirect('invoice_manage')

@user_passes_test(is_admin)
def invoice_mark_paid(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)
    invoice.status = 'paid'
    invoice.paid_date = timezone.now()
    invoice.save()
    messages.success(request, f'Invoice marked as paid for {invoice.student.name}')
    return redirect('invoice_manage')

# ============================================
# ROUTINE MANAGEMENT (Admin)
# ============================================

@user_passes_test(is_admin)
def routine_add(request):
    if request.method == 'POST':
        form = RoutineForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Routine added successfully!')
            return redirect('routine_view')
    else:
        form = RoutineForm()
    return render(request, 'core/routine_form.html', {'form': form, 'title': 'Add Routine'})

# ============================================
# RESOURCE MANAGEMENT (Admin)
# ============================================

@user_passes_test(is_admin)
def resource_add(request):
    if request.method == 'POST':
        form = ResourceForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, 'Resource added successfully!')
            return redirect('resources_view')
    else:
        form = ResourceForm()
    return render(request, 'core/resource_form.html', {'form': form, 'title': 'Add Resource'})

# ============================================
# API VIEWS (For AJAX requests)
# ============================================

def api_students(request):
    class_name = request.GET.get('class')
    if class_name:
        students = Student.objects.filter(class_name=class_name).values('id', 'student_id', 'name', 'roll')
        return JsonResponse(list(students), safe=False)
    return JsonResponse([], safe=False)
