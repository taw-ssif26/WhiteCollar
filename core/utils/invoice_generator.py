from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import os
from django.conf import settings

def generate_invoice_pdf(invoice):
    """Generate PDF invoice"""
    filename = f"invoice_{invoice.id}_{invoice.student.student_id}.pdf"
    filepath = os.path.join(settings.MEDIA_ROOT, 'invoices', filename)
    
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
        alignment=1
    )
    story.append(Paragraph("ELITE ENGLISH COACHING", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Invoice details
    data = [
        ['Invoice #', f"INV-{invoice.id}"],
        ['Date', invoice.generated_date.strftime('%B %d, %Y')],
        ['Student', invoice.student.name],
        ['Student ID', invoice.student.student_id],
        ['Month', invoice.month],
        ['Year', str(invoice.year)],
        ['Amount', f"${invoice.amount}"],
        ['Status', invoice.status.upper()],
    ]
    
    table = Table(data, colWidths=[2*inch, 3*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#0b1326')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#dae2fd')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#C5A059')),
    ]))
    
    story.append(table)
    doc.build(story)
    
    return filepath
