import uuid
import random
from datetime import datetime, timedelta
from sqlmodel import Session
from app.core.db import engine
from app.models.email_log import EmailLog

def seed_email_logs():
    with Session(engine) as session:
        # Check if already seeded
        if session.query(EmailLog).first():
            print("Email logs already seeded.")
            return

        print("Seeding Email logs...")
        
        email_types = ["ORDER_CONFIRMATION", "PAYMENT_SUCCESS", "SHIPPING_STATUS"]
        statuses = ["SENT", "SENT", "SENT", "SENT", "FAILED"] # 80% success rate
        
        now = datetime.utcnow()
        
        for i in range(50):
            status = random.choice(statuses)
            email_type = random.choice(email_types)
            # Random time in the last 7 days
            sent_at = now - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23))
            
            log = EmailLog(
                user_id=uuid.uuid4(),
                order_id=uuid.uuid4(),
                email_type=email_type,
                recipient=f"customer{i}@example.com",
                status=status,
                sent_at=sent_at,
                error_message=None if status == "SENT" else "Connection timeout"
            )
            session.add(log)
        
        session.commit()
        print("Successfully seeded Email logs.")

if __name__ == "__main__":
    seed_email_logs()
