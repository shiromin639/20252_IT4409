# pyright: reportImportCycles = false
from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Column, DateTime, Field, Relationship, SQLModel, text

if TYPE_CHECKING:
    from .product import Product


class CategoryBase(SQLModel):
    name: str = Field(max_length=255)
    slug: str = Field(max_length=255)
    description: str | None = Field(default=None)
    is_active: bool = Field(default=True)


class Category(CategoryBase, table=True):
    __tablename__ = "categories"  # pyright: ignore[reportAssignmentType]
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True), server_default=text("now()"), nullable=False
        ),
    )
    products: list["Product"] = Relationship(back_populates="category")


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255)
    slug: str | None = None
    description: str | None = None
    is_active: bool | None = None


class CategoryPublic(CategoryBase):
    id: int
    created_at: datetime


class CategoriesPublic(SQLModel):
    data: list[CategoryPublic]
    count: int
