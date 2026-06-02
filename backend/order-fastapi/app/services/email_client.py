import logging
import smtplib
from email.message import EmailMessage
from typing import Dict, Any

from app.core.config import settings
from app.services.email_templates import (
    get_order_confirmation_template,
    get_payment_success_template,
    get_shipping_status_template
)

logger = logging.getLogger(__name__)

class EmailClient:
    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.user = settings.SMTP_USERNAME
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.EMAIL_FROM

    def _send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        logger.info("Preparing email...")
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = self.from_email
        msg["To"] = to_email
        msg.add_alternative(html_content, subtype="html")

        try:
            with smtplib.SMTP(self.host, self.port) as server:
                server.starttls()
                server.login(self.user, self.password)
                logger.info("SMTP connected.")
                server.send_message(msg)
            logger.info("Email sent successfully.")
            return True
        except Exception as e:
            logger.error(f"Email send failed: {e}")
            return False

    def send_order_confirmation(self, payload: Dict[str, Any]):
        html_content = get_order_confirmation_template(payload)
        logger.info(f"[EMAIL_LOG] Template: Order Confirmation | Recipient: {payload.get('recipient')} | Order ID: {payload.get('order_id')}")
        return self._send_email(payload.get('recipient'), f"Xác nhận đơn hàng #{payload.get('order_id')}", html_content)

    def send_payment_success(self, payload: Dict[str, Any]):
        html_content = get_payment_success_template(payload)
        logger.info(f"[EMAIL_LOG] Template: Payment Successful | Recipient: {payload.get('recipient')} | Order ID: {payload.get('order_id')}")
        return self._send_email(payload.get('recipient'), f"Thanh toán thành công đơn hàng #{payload.get('order_id')}", html_content)

    def send_shipping_status(self, payload: Dict[str, Any]):
        html_content = get_shipping_status_template(payload)
        status_text = "đang giao" if payload.get('status', '').lower() == "shipped" else ("đã giao" if payload.get('status', '').lower() == "delivered" else "cập nhật")
        logger.info(f"[EMAIL_LOG] Template: Shipping Status ({payload.get('status')}) | Recipient: {payload.get('recipient')} | Order ID: {payload.get('order_id')}")
        return self._send_email(payload.get('recipient'), f"Đơn hàng #{payload.get('order_id')} {status_text}", html_content)

email_client = EmailClient()
