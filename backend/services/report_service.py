from io import BytesIO
from reportlab.pdfgen import canvas
import os
from datetime import datetime

REPORT_DIR = "backend/reports"
os.makedirs(REPORT_DIR, exist_ok=True)

async def generate_full_report(user, prediction, shap_factors, db) -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    file_path = os.path.join(REPORT_DIR, f"{user.id}_full_{timestamp}.pdf")
    c = canvas.Canvas(file_path)
    c.drawString(100, 750, f"Aegis Heart Full Report")
    c.drawString(100, 730, f"Patient: {user.profile.full_name if user.profile else user.email}")
    c.drawString(100, 710, f"Risk: {prediction.risk_percentage}% - {prediction.risk_category}")
    c.save()
    return file_path

async def generate_passport_pdf(user, prediction, achievements, db) -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    file_path = os.path.join(REPORT_DIR, f"{user.id}_passport_{timestamp}.pdf")
    c = canvas.Canvas(file_path)
    c.drawString(100, 750, f"Aegis Heart Health Passport")
    c.drawString(100, 730, f"Patient: {user.profile.full_name if user.profile else user.email}")
    c.save()
    return file_path
