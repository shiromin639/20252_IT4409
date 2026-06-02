import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class EmailLog(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: Optional[uuid.UUID] = Field(default=None)
    order_id: Optional[uuid.UUID] = Field(default=None)
    email_type: str
    recipient: str
    status: str # 'SENT', 'FAILED'
    sent_at: datetime = Field(default_factory=datetime.utcnow)
    error_message: Optional[str] = Field(default=None)
