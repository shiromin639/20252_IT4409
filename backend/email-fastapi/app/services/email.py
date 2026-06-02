import logging
import smtplib
from email.message import EmailMessage
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

from app.core.config import settings

logger = logging.getLogger(__name__)

# Setup Jinja2 environment
TEMPLATE_DIR = Path(__file__).parent.parent / "templates"
env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))

class EmailService:
    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.user = settings.SMTP_USERNAME
        self.password = settings.SMTP_PASSWORD
        self.from_email = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM}>"

    def _send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Helper to send email via SMTP."""
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = self.from_email
        msg["To"] = to_email
        msg.add_alternative(html_content, subtype="html")

        try:
            with smtplib.SMTP(self.host, self.port) as server:
                server.starttls()
                server.login(self.user, self.password)
                server.send_message(msg)
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    def send_order_confirmation(self, to_email: str, order_data: dict) -> bool:
        template = env.get_template("order_confirmation.html")
        html_content = template.render(order=order_data)
        return self._send_email(to_email, f"Order Confirmation #{order_data.get('order_id')}", html_content)

    def send_payment_success(self, to_email: str, payment_data: dict) -> bool:
        template = env.get_template("payment_success.html")
        html_content = template.render(payment=payment_data)
        return self._send_email(to_email, "Payment Successful", html_content)

    def send_shipping_status(self, to_email: str, status_data: dict) -> bool:
        template = env.get_template("shipping_status.html")
        html_content = template.render(status=status_data)
        return self._send_email(to_email, f"Order Status Update: {status_data.get('status')}", html_content)

    def send_password_reset(self, to_email: str, reset_data: dict) -> bool:
        template = env.get_template("password_reset.html")
        html_content = template.render(reset=reset_data)
        return self._send_email(to_email, "Password Reset Request", html_content)

email_service = EmailService()
