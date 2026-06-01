from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlmodel import Column, DateTime, Field, Relationship, SQLModel, text

if TYPE_CHECKING:
    from .product import Product

class ReviewStatus(str, Enum):
    ACTIVE = "ACTIVE"
    HIDDEN = "HIDDEN"

class ReviewBase(SQLModel):
    product_id: int = Field(foreign_key="products.id", index=True)
    user_id: int = Field(index=True)
    rating: int = Field(ge=1, le=5)
    title: str = Field(max_length=255)
    comment: str = Field(max_length=2000)
    is_verified_purchase: bool = Field(default=False)
    review_status: str = Field(default=ReviewStatus.ACTIVE.value)

class Review(ReviewBase, table=True):
    __tablename__ = "reviews" # pyright: ignore[reportAssignmentType]
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
    product: "Product" = Relationship(back_populates="reviews")

class ReviewCreate(SQLModel):
    product_id: int
    rating: int = Field(ge=1, le=5)
    title: str = Field(max_length=255)
    comment: str = Field(max_length=2000)

class ReviewUpdate(SQLModel):
    rating: int | None = Field(default=None, ge=1, le=5)
    title: str | None = Field(default=None, max_length=255)
    comment: str | None = Field(default=None, max_length=2000)

class ReviewPublic(ReviewBase):
    id: int
    created_at: datetime
    updated_at: datetime

class ReviewsPublic(SQLModel):
    data: list[ReviewPublic]
    count: int

class RatingSummary(SQLModel):
    average_rating: float
    total_reviews: int
    rating_breakdown: dict[int, float] # percentage for each star 1-5
