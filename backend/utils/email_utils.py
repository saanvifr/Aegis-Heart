import logging
import smtplib
from email.message import EmailMessage
from backend.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

async def _send_email(email: str, subject: str, content: str):
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASS:
        try:
            msg = EmailMessage()
            msg.set_content(content)
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_FROM
            msg["To"] = email
            
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASS)
                server.send_message(msg)
            logger.info(f"Email sent to {email}")
        except Exception as e:
            logger.error(f"Failed to send email to {email}: {e}")
    else:
        logger.info(f"DEMO MODE: Email to {email} | Subject: {subject} | Content: {content}")

async def send_verification_email(email: str, token: str) -> str:
    link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    content = f"Please verify your Aegis Heart account by clicking the link: {link}"
    await _send_email(email, "Verify your Aegis Heart account", content)
    return token

async def send_reset_email(email: str, token: str) -> str:
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    content = f"Reset your Aegis Heart password by clicking the link: {link}"
    await _send_email(email, "Reset your Aegis Heart password", content)
    return token
