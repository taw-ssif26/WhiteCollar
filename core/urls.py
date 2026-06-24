# core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Public pages
    path('', views.front_page, name='front_page'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('events/', views.events_view, name='events_view'),
    path('gallery/', views.gallery_view, name='gallery_view'),
    path('results/', views.results_view, name='results_view'),
    path('achievements/', views.achievements_view, name='achievements_view'),
    path('teacher/', views.teacher_view, name='teacher_view'),
    path('about/', views.about_view, name='about_view'),
    path('contact/', views.contact_view, name='contact_view'),
    path('admission/', views.admission_view, name='admission_view'),
    
    # Student dashboard
    path('dashboard/', views.student_dashboard, name='student_dashboard'),
    path('update-profile/', views.update_profile, name='update_profile'),
    path('routine/', views.routine_view, name='routine_view'),
    path('invoice-request/', views.invoice_request, name='invoice_request'),
    path('resources/', views.resources_view, name='resources_view'),
    
    # Invoice
    path('invoice/download/<int:pk>/', views.invoice_download, name='invoice_download'),
    
    # Progress Report
    path('report/download/', views.download_progress_report, name='download_progress_report'),
    
    # Attendance (Student view)
    path('attendance/', views.attendance_view, name='attendance_view'),
    
    # Admin Dashboard
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    
    # Student management
    path('admin/students/', views.student_list, name='student_list'),
    path('admin/students/add/', views.student_add, name='student_add'),
    path('admin/students/edit/<int:pk>/', views.student_edit, name='student_edit'),
    path('admin/students/delete/<int:pk>/', views.student_delete, name='student_delete'),
    
    # Event management
    path('admin/events/add/', views.event_add, name='event_add'),
    path('admin/events/edit/<int:pk>/', views.event_edit, name='event_edit'),
    path('admin/events/delete/<int:pk>/', views.event_delete, name='event_delete'),
    
    # Gallery management
    path('admin/gallery/add/', views.gallery_add, name='gallery_add'),
    path('admin/gallery/delete/<int:pk>/', views.gallery_delete, name='gallery_delete'),
    
    # Result management
    path('admin/results/add/', views.result_add, name='result_add'),
    path('admin/results/upload/', views.result_upload_excel, name='result_upload_excel'),
    
    # Achievement management
    path('admin/achievements/add/', views.achievement_add, name='achievement_add'),
    path('admin/achievements/edit/<int:pk>/', views.achievement_edit, name='achievement_edit'),
    path('admin/achievements/delete/<int:pk>/', views.achievement_delete, name='achievement_delete'),
    
    # Invoice management
    path('admin/invoices/', views.invoice_manage, name='invoice_manage'),
    path('admin/invoices/approve/<int:pk>/', views.invoice_approve, name='invoice_approve'),
    path('admin/invoices/paid/<int:pk>/', views.invoice_mark_paid, name='invoice_mark_paid'),
    
    # Routine management
    path('admin/routines/add/', views.routine_add, name='routine_add'),
    
    # ✅ Attendance management (Admin) - FIXED URLs
    path('attendance/manage/', views.attendance_manage, name='attendance_manage'),
    path('attendance/history/', views.attendance_history, name='attendance_history'),
    path('attendance/history/<int:student_id>/', views.attendance_history, name='attendance_history_student'),
    
    # Resource management
    path('admin/resources/add/', views.resource_add, name='resource_add'),
    
    # API
    path('api/students/', views.api_students, name='api_students'),
]
