from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from sqlmodel import (
    JSON,
    Column,
    DateTime,
    Field,
    ForeignKey,
    Integer,
    Relationship,
    Numeric,
    SQLModel,
    text,
)

if TYPE_CHECKING:
    from .category import Category


class ProductBase(SQLModel):
    name: str = Field(max_length=255)
    slug: str = Field(max_length=255)
    sku: str = Field(max_length=255)
    description: str | None = Field(default=None)
    price: Decimal = Field(
        gt=0, sa_column=Column(Numeric(precision=12, scale=2), nullable=False)
    )
    original_price: Decimal | None = Field(
        default=None, sa_column=Column(Numeric(precision=12, scale=2), nullable=True)
    )
    specifications: dict[str, Any] | None = Field(default=None, sa_column=Column(JSON))
    is_active: bool = Field(default=True)
    category_id: int = Field(
        sa_column=Column(
            Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False
        )
    )


class Product(ProductBase, table=True):
    __tablename__ = "products"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)

    created_at: datetime | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True), server_default=text("now()"), nullable=False
        ),
    )
    category: "Category" = Relationship(back_populates="products")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255)
    slug: str | None = None
    sku: str | None = None
    description: str | None = None
    price: Decimal | None = Field(default=None, gt=0)
    original_price: Decimal | None = None
    specifications: dict[str, Any] | None = None
    is_active: bool | None = None
    category_id: int | None = None


class ProductPublic(ProductBase):
    id: int
    created_at: datetime


class ProductsPublic(SQLModel):
    data: list[ProductPublic]
    count: int
