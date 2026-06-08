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
    Computed
)
from sqlalchemy.dialects.postgresql import TSVECTOR

if TYPE_CHECKING:
    from .category import Category
    from .review import Review


class ProductBase(SQLModel):
    name: str = Field(max_length=255)
    slug: str = Field(max_length=255)
    sku: str = Field(max_length=255)
    brand: str = Field(max_length=255, default="Unknown")
    description: str | None = Field(default=None)
    image_url: str | None = Field(default=None, max_length=512)
    price: Decimal = Field(
        gt=0, sa_column=Column(Numeric(precision=12, scale=2), nullable=False)
    )
    original_price: Decimal | None = Field(
        default=None, sa_column=Column(Numeric(precision=12, scale=2), nullable=True)
    )
    average_rating: float = Field(default=5.0)
    total_reviews: int = Field(default=0)
    discount_percent: int = Field(default=0)
    is_featured: bool = Field(default=False)
    is_bestseller: bool = Field(default=False)
    total_sold: int = Field(default=0)
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
    
    search_vector: Any | None = Field(
        default=None,
        sa_column=Column(
            TSVECTOR,
            Computed(
                "to_tsvector('simple', f_unaccent(coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, '')))",
                persisted=True
            )
        )
    )

    category: "Category" = Relationship(back_populates="products")
    reviews: list["Review"] = Relationship(back_populates="product")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255)
    slug: str | None = None
    sku: str | None = None
    brand: str | None = Field(default=None, max_length=255)
    description: str | None = None
    image_url: str | None = Field(default=None, max_length=512)
    price: Decimal | None = Field(default=None, gt=0)
    original_price: Decimal | None = None
    average_rating: float | None = None
    total_reviews: int | None = None
    discount_percent: int | None = None
    is_featured: bool | None = None
    is_bestseller: bool | None = None
    total_sold: int | None = None
    specifications: dict[str, Any] | None = None
    is_active: bool | None = None
    category_id: int | None = None


class ProductPublic(ProductBase):
    id: int
    created_at: datetime


class ProductsPublic(SQLModel):
    data: list[ProductPublic]
    count: int
