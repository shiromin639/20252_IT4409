from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import TYPE_CHECKING

from sqlmodel import Column, DateTime, Field, Numeric, Relationship, SQLModel, text

if TYPE_CHECKING:
    from .order_item import OrderItem


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class OrderBase(SQLModel):
    user_id: str
    status: OrderStatus = Field(default=OrderStatus.PENDING)
    total_amount: Decimal = Field(
        default=Decimal("0"),
        sa_column=Column(Numeric(precision=12, scale=2), nullable=False),
    )
    shipping_address: str | None = Field(default=None)


class Order(OrderBase, table=True):
    __tablename__ = "orders"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True), server_default=text("now()"), nullable=False
        ),
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("now()"),
            server_onupdate=text("now()"),
            nullable=False,
        ),
    )
    items: list["OrderItem"] = Relationship(back_populates="order")


class OrderCreate(SQLModel):
    user_id: str
    shipping_address: str | None = None
    items: list["OrderItemCreate"] = []


class OrderUpdate(SQLModel):
    status: OrderStatus | None = None
    shipping_address: str | None = None


class OrderPublic(OrderBase):
    id: int
    created_at: datetime
    updated_at: datetime


class OrdersPublic(SQLModel):
    data: list[OrderPublic]
    count: int


# avoid circular import at module level
from .order_item import OrderItemCreate  # noqa: E402
