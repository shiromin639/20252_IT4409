# pyright: reportImportCycles = false
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlmodel import Column, Field, ForeignKey, Integer, Numeric, Relationship, SQLModel

if TYPE_CHECKING:
    from .order import Order


class OrderItemBase(SQLModel):
    product_id: int
    quantity: int = Field(ge=1)
    unit_price: Decimal = Field(
        sa_column=Column(Numeric(precision=12, scale=2), nullable=False)
    )


class OrderItem(OrderItemBase, table=True):
    __tablename__ = "order_items"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    order_id: int = Field(
        sa_column=Column(
            Integer,
            ForeignKey("orders.id", ondelete="CASCADE"),
            nullable=False,
        )
    )
    order: "Order" = Relationship(back_populates="items")


class OrderItemCreate(SQLModel):
    product_id: int
    quantity: int = Field(ge=1)
    unit_price: Decimal = Field(gt=0)


class OrderItemPublic(OrderItemBase):
    id: int
    order_id: int
