# core/utils/invoice_generator.py
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
import os
from django.conf import settings
from datetime import datetime

def generate_invoice_pdf(invoice):
    """Generate professional PDF invoice"""
    filename = f"invoice_{invoice.id}_{invoice.student.student_id}.pdf"
    filepath = os.path.join(settings.MEDIA_ROOT, 'invoices', filename)
    
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    doc = SimpleDocTemplate(filepath, pagesize=letter, 
                           rightMargin=72, leftMargin=72,
                           topMargin=72, bottomMargin=72)
    
    styles = getSampleStyleSheet()
    story = []
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#C5A059'),
        alignment=TA_CENTER,
        spaceAfter=12
    )
    
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#666666'),
        alignment=TA_RIGHT
    )
    
    # Header
    story.append(Paragraph("WHITE COLLAR", title_style))
    story.append(Paragraph("Excellence in English Education", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Invoice details
    story.append(Paragraph(f"Invoice #{invoice.id}", styles['Heading2']))
    story.append(Spacer(1, 0.2*inch))
    
    # Invoice data table
    data = [
        ['Invoice Date:', invoice.generated_date.strftime('%B %d, %Y')],
        ['Student:', invoice.student.name],
        ['Student ID:', invoice.student.student_id],
        ['Class:', invoice.student.class_name],
        ['Month:', invoice.month],
        ['Year:', str(invoice.year)],
        ['Description:', invoice.description or 'Monthly Tuition Fee'],
        ['', ''],
        ['', ''],
        ['Tuition Fee:', f"BDT {invoice.amount:,.2f}"],  # ← BDT format
        ['', ''],
        ['Total:', f"BDT {invoice.amount:,.2f}"],  # ← BDT format
        ['', ''],
        ['Status:', invoice.status.upper()],
    ]
    
    table = Table(data, colWidths=[2*inch, 3*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#0b1326')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#dae2fd')),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#C5A059')),
        ('BACKGROUND', (0, 8), (-1, 8), colors.HexColor('#C5A059')),
        ('TEXTCOLOR', (0, 8), (-1, 8), colors.HexColor('#0b1326')),
        ('FONTWEIGHT', (0, 8), (-1, 8), 'BOLD'),
        ('BACKGROUND', (0, 10), (-1, 10), colors.HexColor('#C5A059')),
        ('TEXTCOLOR', (0, 10), (-1, 10), colors.HexColor('#0b1326')),
        ('FONTWEIGHT', (0, 10), (-1, 10), 'BOLD'),
    ]))
    
    story.append(table)
    story.append(Spacer(1, 0.5*inch))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#666666'),
        alignment=TA_CENTER
    )
    story.append(Paragraph("Thank you for choosing White Collar!", footer_style))
    story.append(Paragraph("For any queries, contact: admissions@whitecollar.edu | +880 1234 567890", footer_style))
    
    doc.build(story)
    
    return filepath
