import openpyxl
from datetime import datetime

def parse_excel_results(excel_file):
    """Parse Excel file and extract results"""
    workbook = openpyxl.load_workbook(excel_file)
    sheet = workbook.active
    
    results = []
    
    # Assuming headers: Student ID, Exam Name, Subject, Marks, Total Marks, Grade, Exam Date
    for row in sheet.iter_rows(min_row=2, values_only=True):
        if row[0] and row[1]:
            result = {
                'student_id': str(row[0]),
                'exam_name': str(row[1]),
                'subject': str(row[2]),
                'marks': float(row[3]),
                'total_marks': float(row[4]),
                'grade': str(row[5]),
                'exam_date': row[6] if row[6] else datetime.now().date()
            }
            results.append(result)
    
    return results
