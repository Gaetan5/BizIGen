"""
BizGen AI - Notification Service
Handles Email and WhatsApp communication.
Professional delivery of business documents.
"""
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)

class NotificationService:
    """
    Expert Delivery Agent.
    Sends business documents via professional channels.
    """
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_pass = settings.SMTP_PASSWORD
        self.email_from = settings.EMAIL_FROM

    async def send_business_plan_email(self, to_email: str, project_name: str, share_url: str):
        """Send professional email with the business plan link"""
        if not self.smtp_host or not self.smtp_user:
            logger.warning("SMTP not configured. Email delivery skipped.")
            return False

        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_from
            msg['To'] = to_email
            msg['Subject'] = f"Votre Business Plan : {project_name} - BizGen AI"

            body = f"""
            Bonjour,
            
            Félicitations ! Votre Business Plan pour le projet '{project_name}' a été généré avec succès par BizGen AI.
            
            Vous pouvez le consulter et le partager via le lien sécurisé suivant :
            {share_url}
            
            Ce lien est valable 30 jours.
            
            L'équipe BizGen AI vous souhaite beaucoup de succès dans votre aventure entrepreneuriale.
            
            ---
            BizGen AI - L'excellence au service de l'entrepreneuriat africain.
            """
            msg.attach(MIMEText(body, 'plain'))

            def _send_email_sync():
                with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_pass)
                    server.send_message(msg)
            
            import asyncio
            await asyncio.to_thread(_send_email_sync)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

    async def send_password_reset_email(self, to_email: str, reset_url: str, user_name: Optional[str] = None) -> bool:
        """Send password reset email via SMTP"""
        if not self.smtp_host or not self.smtp_user:
            logger.warning("SMTP not configured. Password reset email delivery skipped, URL logged.")
            return False

        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_from
            msg['To'] = to_email
            msg['Subject'] = "Réinitialisation de votre mot de passe - BizGen AI"

            name = user_name or "Entrepreneur"
            body = f"""
Bonjour {name},

Vous avez demandé la réinitialisation de votre mot de passe sur BizGen AI.

Veuillez cliquer sur le lien suivant pour choisir un nouveau mot de passe sécurisé :
{reset_url}

Ce lien est strictement confidentiel et expirera dans 1 heure.

Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.

Cordialement,
L'équipe BizGen AI
---
BizGen AI - La plateforme d'intelligence d'affaires et de génération de business plans.
"""
            msg.attach(MIMEText(body, 'plain'))

            def _send_reset_sync():
                with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_pass)
                    server.send_message(msg)

            import asyncio
            await asyncio.to_thread(_send_reset_sync)
            logger.info(f"Password reset email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send password reset email to {to_email}: {e}")
            return False

    def generate_whatsapp_link(self, phone_number: str, project_name: str, share_url: str) -> str:
        """Generate a wa.me link with a pre-filled business message"""
        import urllib.parse
        message = f"Bonjour ! Voici mon Business Plan pour '{project_name}' généré par BizGen AI : {share_url}"
        encoded_msg = urllib.parse.quote(message)
        # phone_number should be in international format without +
        return f"https://wa.me/{phone_number}?text={encoded_msg}"

# Singleton instance
notification_service = NotificationService()
