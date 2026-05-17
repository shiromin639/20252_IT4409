# pyright: reportImportCycles = false
from typing import TYPE_CHECKING

from sqlmodel import Column, Field, ForeignKey, Integer, Relationship, SQLModel

if TYPE_CHECKING:
    from .cart import Cart


class CartItemBase(SQLModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class CartItem(CartItemBase, table=True):
    __tablename__ = "cart_items"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    cart_id: int = Field(
        sa_column=Column(
            Integer,
            ForeignKey("carts.id", ondelete="CASCADE"),
            nullable=False,
        )
    )
    cart: "Cart" = Relationship(back_populates="items")


class CartItemAdd(SQLModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(SQLModel):
    quantity: int = Field(ge=1)


class CartItemPublic(CartItemBase):
    id: int
    cart_id: int
