from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
import json
from .models import *
from .forms import *
from .utils.supabase_client import get_supabase_client, get_supabase_service_client

def is_admin(user):
    return user.is_superuser or user.is_staff

def front_page(request):
    # Fetch data from Supabase
    supabase = get_supabase_client()
    
    # Get events
    events_response = supabase.table('core_event').select('*').eq('event_type', 'upcoming').limit(3).execute()
    events = events_response.data if events_response.data else []
    
    # Get achievements
    achievements_response = supabase.table('core_achievement').select('*').limit(3).order('date', desc=True).execute()
    achievements = achievements_response.data if achievements_response.data else []
    
    # Get gallery
    gallery_response = supabase.table('core_gallery').select('*').limit(6).order('uploaded_date', desc=True).execute()
    gallery = gallery_response.data if gallery_response.data else []
    
    # Get results
    results_response = supabase.table('core_result').select('*, student:student_id(*)').order('percentage', desc=True).limit(3).execute()
    results = results_response.data if results_response.data else []
    
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
        
        # Check if it's admin
        user = authenticate(request, username=student_id, password=password)
        if user is not None:
            login(request, user)
            if user.is_superuser or user.is_staff:
                return redirect('admin_dashboard')
            elif hasattr(user, 'student'):
                return redirect('student_dashboard')
        
        # Check if student
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

@login_required
def student_dashboard(request):
    if not hasattr(request.user, 'student'):
        return redirect('front_page')
    
    student = request.user.student
    supabase = get_supabase_client()
    
    # Get attendance
    attendance_response = supabase.table('core_attendance').select('*').eq('student_id', student.id).limit(10).execute()
    attendances = attendance_response.data if attendance_response.data else []
    
    # Get results
    results_response = supabase.table('core_result').select('*').eq('student_id', student.id).order('exam_date', desc=True).limit(5).execute()
    results = results_response.data if results_response.data else []
    
    # Get invoices
    invoices_response = supabase.table('core_invoice').select('*').eq('student_id', student.id).order('generated_date', desc=True).limit(5).execute()
    invoices = invoices_response.data if invoices_response.data else []
    
    # Get routine
    routine_response = supabase.table('core_routine').select('*').eq('class_obj__name', student.class_name).execute()
    routine = routine_response.data if routine_response.data else []
    
    # Calculate attendance percentage
    total_days = len(attendances)
    present_days = sum(1 for a in attendances if a.get('status') == 'present')
    attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0
    
    # Get exam data for graph
    exam_names = []
    exam_data = []
    for result in results:
        exam_names.append(result.get('exam_name', ''))
        exam_data.append(result.get('percentage', 0))
    
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

@user_passes_test(is_admin)
def admin_dashboard(request):
    total_students = Student.objects.count()
    total_events = Event.objects.count()
    pending_invoices = Invoice.objects.filter(status='pending').count()
    absent_today = Attendance.objects.filter(date=timezone.now().date(), status='absent').count()
    
    recent_students = Student.objects.all().order_by('-admission_date')[:10]
    recent_events = Event.objects.all().order_by('-date')[:5]
    recent_invoices = Invoice.objects.filter(status='pending').order_by('-generated_date')[:10]
    
    context = {
        'total_students': total_students,
        'total_events': total_events,
        'pending_invoices': pending_invoices,
        'absent_today': absent_today,
        'recent_students': recent_students,
        'recent_events': recent_events,
        'recent_invoices': recent_invoices,
    }
    return render(request, 'core/admin_dashboard.html', context)

# Student Management Views
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

# Event Views
def events_view(request):
    upcoming = Event.objects.filter(event_type='upcoming').order_by('date')
    completed = Event.objects.filter(event_type='completed').order_by('-date')
    return render(request, 'core/events.html', {'upcoming': upcoming, 'completed': completed})

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

# Gallery Views
def gallery_view(request):
    images = Gallery.objects.all()
    return render(request, 'core/gallery.html', {'images': images})

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

# Results Views
def results_view(request):
    top_results = Result.objects.all().order_by('-percentage')[:3]
    all_results = Result.objects.all().order_by('-exam_date', '-percentage')
    return render(request, 'core/results.html', {'top_results': top_results, 'all_results': all_results})

@user_passes_test(is_admin)
def result_add(request):
    if request.method == 'POST':
        form = ResultForm(request.POST)
        if form.is_valid():
            result = form.save()
            # Send SMS to student
            try:
                student = result.student
                message = f"Dear {student.name}, your result for {result.exam_name} - {result.subject}: {result.marks}/{result.total_marks} ({result.percentage}%) Grade: {result.grade}"
                send_sms(student.phone, message)
            except:
                pass
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
            excel_file = request.FILES['excel_file']
            results = parse_excel_results(excel_file)
            count = 0
            for result_data in results:
                try:
                    student = Student.objects.get(student_id=result_data['student_id'])
                    Result.objects.create(
                        student=student,
                        exam_name=result_data['exam_name'],
                        subject=result_data['subject'],
                        marks=result_data['marks'],
                        total_marks=result_data['total_marks'],
                        percentage=(result_data['marks'] / result_data['total_marks']) * 100,
                        grade=result_data['grade'],
                        exam_date=result_data['exam_date']
                    )
                    count += 1
                except Student.DoesNotExist:
                    continue
            messages.success(request, f'{count} results uploaded successfully!')
            return redirect('results_view')
    else:
        form = ExcelUploadForm()
    return render(request, 'core/result_upload.html', {'form': form})

# Achievement Views
def achievements_view(request):
    achievements = Achievement.objects.all()
    return render(request, 'core/achievements.html', {'achievements': achievements})

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

# Teacher Profile
def teacher_view(request):
    try:
        teacher = Teacher.objects.first()
    except:
        teacher = None
    return render(request, 'core/teacher.html', {'teacher': teacher})

# About View
def about_view(request):
    try:
        about = AboutInfo.objects.first()
    except:
        about = None
    return render(request, 'core/about.html', {'about': about})

# Contact View
def contact_view(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            contact = form.save()
            messages.success(request, 'Your message has been sent successfully!')
            return redirect('contact_view')
    else:
        form = ContactForm()
    return render(request, 'core/contact.html', {'form': form})

# Admission Form
def admission_view(request):
    if request.method == 'POST':
        form = AdmissionForm(request.POST)
        if form.is_valid():
            supabase = get_supabase_service_client()
            
            # Insert into Supabase
            data = {
                'name': form.cleaned_data['name'],
                'class_name': form.cleaned_data['class_name'],
                'roll': form.cleaned_data['roll'],
                'email': form.cleaned_data['email'],
                'phone': form.cleaned_data['phone'],
                'guardian_phone': form.cleaned_data['guardian_phone'],
                'school_name': form.cleaned_data['school_name'],
                'heard_from': form.cleaned_data['heard_from'],
                'created_at': timezone.now().isoformat()
            }
            
            response = supabase.table('admission_requests').insert(data).execute()
            
            # Send to Telegram
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
            
            messages.success(request, 'Admission request submitted successfully! We will contact you soon.')
            return redirect('admission_view')
    else:
        form = AdmissionForm()
    return render(request, 'core/admission.html', {'form': form})

# Invoice Views
@login_required
def invoice_request(request):
    if request.method == 'POST':
        student = request.user.student
        month = request.POST.get('month')
        year = request.POST.get('year')
        
        invoice = Invoice.objects.create(
            student=student,
            month=month,
            year=year,
            amount=1500.00  # Default fee
        )
        messages.success(request, 'Invoice requested successfully! Waiting for admin approval.')
        return redirect('student_dashboard')
    
    return render(request, 'core/invoice_request.html')

@user_passes_test(is_admin)
def invoice_manage(request):
    invoices = Invoice.objects.all().order_by('-generated_date')
    return render(request, 'core/invoice_manage.html', {'invoices': invoices})

@user_passes_test(is_admin)
def invoice_approve(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)
    invoice.status = 'approved'
    invoice.approved_date = timezone.now()
    invoice.save()
    
    # Generate PDF
    pdf_path = generate_invoice_pdf(invoice)
    invoice.pdf_file = pdf_path
    invoice.save()
    
    messages.success(request, f'Invoice approved for {invoice.student.name}')
    return redirect('invoice_manage')

@user_passes_test(is_admin)
def invoice_mark_paid(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)
    invoice.status = 'paid'
    invoice.paid_date = timezone.now()
    invoice.save()
    
    messages.success(request, f'Invoice marked as paid for {invoice.student.name}')
    return redirect('invoice_manage')

# Routine Views
@login_required
def routine_view(request):
    if request.user.is_superuser or request.user.is_staff:
        routines = Routine.objects.all().order_by('class_obj', 'day', 'start_time')
        return render(request, 'core/routine_admin.html', {'routines': routines})
    else:
        student = request.user.student
        routines = Routine.objects.filter(class_obj__name=student.class_name)
        return render(request, 'core/routine.html', {'routines': routines})

@user_passes_test(is_admin)
def routine_add(request):
    if request.method == 'POST':
        form = RoutineForm(request.POST)
        if form.is_valid():
            routine = form.save()
            messages.success(request, f'Routine added successfully!')
            return redirect('routine_view')
    else:
        form = RoutineForm()
    return render(request, 'core/routine_form.html', {'form': form, 'title': 'Add Routine'})

# Attendance Views
@user_passes_test(is_admin)
def attendance_manage(request):
    if request.method == 'POST':
        date = request.POST.get('date')
        class_name = request.POST.get('class_name')
        
        students = Student.objects.filter(class_name=class_name)
        for student in students:
            status = request.POST.get(f'attendance_{student.id}')
            if status:
                Attendance.objects.update_or_create(
                    student=student,
                    date=date,
                    defaults={'status': status}
                )
        
        # Send SMS to absent students
        if request.POST.get('send_sms') == 'on':
            absent_students = Attendance.objects.filter(date=date, status='absent')
            for attendance in absent_students:
                message = f"Dear {attendance.student.name}, you were absent from class on {date}. Please contact the admin for details."
                send_sms(attendance.student.phone, message)
        
        messages.success(request, 'Attendance marked successfully!')
        return redirect('attendance_manage')
    
    classes = Class.objects.all()
    return render(request, 'core/attendance.html', {'classes': classes})

# Resources Views
@login_required
def resources_view(request):
    resources = Resource.objects.all()
    return render(request, 'core/resources.html', {'resources': resources})

@user_passes_test(is_admin)
def resource_add(request):
    if request.method == 'POST':
        form = ResourceForm(request.POST, request.FILES)
        if form.is_valid():
            resource = form.save()
            messages.success(request, f'Resource {resource.title} added successfully!')
            return redirect('resources_view')
    else:
        form = ResourceForm()
    return render(request, 'core/resource_form.html', {'form': form, 'title': 'Add Resource'})
