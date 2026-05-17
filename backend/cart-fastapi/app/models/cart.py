from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Column, DateTime, Field, Relationship, SQLModel, text

if TYPE_CHECKING:
    from .cart_item import CartItem


class CartBase(SQLModel):
    user_id: str = Field(unique=True)


class Cart(CartBase, table=True):
    __tablename__ = "carts"  # pyright: ignore[reportAssignmentType]
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
    items: list["CartItem"] = Relationship(
        back_populates="cart", cascade_delete=True
    )


class CartPublic(CartBase):
    id: int
    created_at: datetime
    updated_at: datetime
