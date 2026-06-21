# core/utils/progress_reports.py
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
import os
from django.conf import settings
from datetime import datetime

def generate_progress_report(student):
    """Generate student progress report PDF"""
    filename = f"progress_{student.student_id}_{datetime.now().strftime('%Y%m')}.pdf"
    filepath = os.path.join(settings.MEDIA_ROOT, 'reports', filename)
    
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#C5A059'),
        alignment=TA_CENTER,
        spaceAfter=12
    )
    
    story.append(Paragraph("WHITE COLLAR", title_style))
    story.append(Paragraph("Student Progress Report", styles['Heading2']))
    story.append(Spacer(1, 0.3*inch))
    
    # Student Info
    info_data = [
        ['Student Name:', student.name],
        ['Student ID:', student.student_id],
        ['Class:', student.class_name],
        ['Report Date:', datetime.now().strftime('%B %d, %Y')],
    ]
    
    info_table = Table(info_data, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#0b1326')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#dae2fd')),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#C5A059')),
    ]))
    
    story.append(info_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Results Summary
    results = student.results.all().order_by('-exam_date')
    
    if results.exists():
        story.append(Paragraph("Academic Performance", styles['Heading2']))
        story.append(Spacer(1, 0.1*inch))
        
        result_data = [['Exam', 'Subject', 'Marks', 'Percentage', 'Grade']]
        for r in results[:10]:
            result_data.append([
                r.exam_name[:20],
                r.subject[:20],
                f"{r.marks}/{r.total_marks}",
                f"{r.percentage:.1f}%",
                r.grade
            ])
        
        result_table = Table(result_data, colWidths=[1.5*inch, 1.5*inch, 1.2*inch, 1.2*inch, 1*inch])
        result_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#C5A059')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0b1326')),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#333333')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        story.append(result_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Calculate average
        avg_percentage = sum(r.percentage for r in results) / results.count()
        story.append(Paragraph(f"<b>Overall Average: {avg_percentage:.1f}%</b>", styles['Normal']))
    
    # Attendance Summary
    attendances = student.attendances.all()
    if attendances.exists():
        total = attendances.count()
        present = attendances.filter(status='present').count()
        attendance_percentage = (present / total * 100) if total > 0 else 0
        
        story.append(Spacer(1, 0.2*inch))
        story.append(Paragraph(f"<b>Attendance: {attendance_percentage:.1f}%</b>", styles['Normal']))
    
    doc.build(story)
    return filepath
