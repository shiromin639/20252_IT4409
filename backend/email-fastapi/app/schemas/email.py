from pydantic import BaseModel
from typing import List, Optional
import uuid

class OrderItemSchema(BaseModel):
    product_name: str
    quantity: int
    price: float

class OrderConfirmationSchema(BaseModel):
    user_id: Optional[uuid.UUID] = None
    order_id: uuid.UUID
    recipient: str
    customer_name: str
    order_date: str
    payment_method: str
    items: List[OrderItemSchema]
    total_amount: float

class PaymentSuccessSchema(BaseModel):
    user_id: Optional[uuid.UUID] = None
    order_id: uuid.UUID
    recipient: str
    customer_name: str
    amount: float

class ShippingStatusSchema(BaseModel):
    user_id: Optional[uuid.UUID] = None
    order_id: uuid.UUID
    recipient: str
    customer_name: str
    status: str

class PasswordResetSchema(BaseModel):
    user_id: Optional[uuid.UUID] = None
    recipient: str
    customer_name: str
    reset_link: str
