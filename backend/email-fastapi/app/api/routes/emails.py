from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select, func
from typing import List, Dict, Any
import datetime

from app.api.deps import get_session
from app.models.email_log import EmailLog
from app.schemas.email import OrderConfirmationSchema, PaymentSuccessSchema, ShippingStatusSchema, PasswordResetSchema
from app.services.email import email_service

router = APIRouter()

def _log_email(session: Session, email_type: str, recipient: str, status: str, order_id=None, user_id=None, error_msg=None):
    log = EmailLog(
        email_type=email_type,
        recipient=recipient,
        status=status,
        order_id=order_id,
        user_id=user_id,
        error_message=error_msg
    )
    session.add(log)
    session.commit()

@router.post("/order-confirmation")
def trigger_order_confirmation(data: OrderConfirmationSchema, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    def task():
        try:
            success = email_service.send_order_confirmation(data.recipient, data.model_dump())
            _log_email(session, "ORDER_CONFIRMATION", data.recipient, "SENT" if success else "FAILED", data.order_id, data.user_id, None if success else "SMTP send failed")
        except Exception as e:
            _log_email(session, "ORDER_CONFIRMATION", data.recipient, "FAILED", data.order_id, data.user_id, str(e))
            
    background_tasks.add_task(task)
    return {"message": "Email task triggered"}

@router.post("/payment-success")
def trigger_payment_success(data: PaymentSuccessSchema, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    def task():
        try:
            success = email_service.send_payment_success(data.recipient, data.model_dump())
            _log_email(session, "PAYMENT_SUCCESS", data.recipient, "SENT" if success else "FAILED", data.order_id, data.user_id, None if success else "SMTP send failed")
        except Exception as e:
            _log_email(session, "PAYMENT_SUCCESS", data.recipient, "FAILED", data.order_id, data.user_id, str(e))
            
    background_tasks.add_task(task)
    return {"message": "Email task triggered"}

@router.post("/shipping-status")
def trigger_shipping_status(data: ShippingStatusSchema, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    def task():
        try:
            success = email_service.send_shipping_status(data.recipient, data.model_dump())
            _log_email(session, "SHIPPING_STATUS", data.recipient, "SENT" if success else "FAILED", data.order_id, data.user_id, None if success else "SMTP send failed")
        except Exception as e:
            _log_email(session, "SHIPPING_STATUS", data.recipient, "FAILED", data.order_id, data.user_id, str(e))
            
    background_tasks.add_task(task)
    return {"message": "Email task triggered"}

@router.post("/password-reset")
def trigger_password_reset(data: PasswordResetSchema, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    def task():
        try:
            success = email_service.send_password_reset(data.recipient, data.model_dump())
            _log_email(session, "PASSWORD_RESET", data.recipient, "SENT" if success else "FAILED", None, data.user_id, None if success else "SMTP send failed")
        except Exception as e:
            _log_email(session, "PASSWORD_RESET", data.recipient, "FAILED", None, data.user_id, str(e))
            
    background_tasks.add_task(task)
    return {"message": "Email task triggered"}

@router.get("/activity")
def get_email_activity(session: Session = Depends(get_session)):
    total = session.exec(select(func.count(EmailLog.id))).one()
    failed = session.exec(select(func.count(EmailLog.id)).where(EmailLog.status == "FAILED")).one()
    
    today = datetime.datetime.utcnow().date()
    today_sent = session.exec(select(func.count(EmailLog.id)).where(
        func.date(EmailLog.sent_at) == today
    )).one()
    
    latest = session.exec(select(EmailLog).order_by(EmailLog.sent_at.desc()).limit(10)).all()
    
    return {
        "total_emails": total,
        "failed_emails": failed,
        "emails_today": today_sent,
        "latest_events": latest
    }
