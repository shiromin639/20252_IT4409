from datetime import datetime
from sqlmodel import Column, DateTime, SQLModel, Field, text
from decimal import Decimal

class PaymentBase(SQLModel):
    order_id: int
    amount: Decimal = Field(max_digits=10, decimal_places=2)
    status: str = Field(default="PENDING")
    payment_method: str = Field(default="CREDIT_CARD")
    transaction_id: str | None = Field(default=None)

class Payment(PaymentBase, table=True):
    __tablename__ = "payment"  # type: ignore
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("now()"),
            nullable=False,
        ),
    )

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(SQLModel):
    status: str
    transaction_id: str | None = None

class PaymentPublic(PaymentBase):
    id: int
    created_at: datetime
