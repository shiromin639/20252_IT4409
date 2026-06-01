from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class Wishlist(SQLModel, table=True):
    __tablename__ = "wishlists"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    items: list["WishlistItem"] = Relationship(back_populates="wishlist", cascade_delete=True)


class WishlistItem(SQLModel, table=True):
    __tablename__ = "wishlist_items"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    wishlist_id: int = Field(foreign_key="wishlists.id")
    product_id: int = Field(foreign_key="products.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    wishlist: Wishlist = Relationship(back_populates="items")
    product: "Product" = Relationship()

