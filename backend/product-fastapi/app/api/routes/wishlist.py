from typing import Any
from fastapi import APIRouter, HTTPException
from sqlmodel import select, func
from app.api.deps import SessionDep, CurrentUserId
from app.models.wishlist import Wishlist, WishlistItem
from app.models.product import Product
from app.core.cache import get_cache, set_cache, invalidate_cache

router = APIRouter(tags=["wishlist"])

@router.get("/wishlist")
async def get_wishlist(session: SessionDep, current_user_id: CurrentUserId) -> Any:
    # Get or create wishlist
    statement = select(Wishlist).where(Wishlist.user_id == current_user_id)
    wishlist = (await session.exec(statement)).first()
    
    if not wishlist:
        wishlist = Wishlist(user_id=current_user_id)
        session.add(wishlist)
        await session.commit()
        await session.refresh(wishlist)
        return {"items": []}
        
    # Get products in wishlist
    statement = (
        select(Product)
        .join(WishlistItem, WishlistItem.product_id == Product.id)
        .where(WishlistItem.wishlist_id == wishlist.id)
        .order_by(WishlistItem.created_at.desc())
    )
    products = (await session.exec(statement)).all()
    
    return {"items": products}

@router.get("/wishlist/count")
async def get_wishlist_count(session: SessionDep, current_user_id: CurrentUserId) -> Any:
    statement = select(Wishlist).where(Wishlist.user_id == current_user_id)
    wishlist = (await session.exec(statement)).first()
    
    if not wishlist:
        return {"count": 0}
        
    statement = select(func.count(WishlistItem.id)).where(WishlistItem.wishlist_id == wishlist.id)
    count = (await session.exec(statement)).one()
    
    return {"count": count}

from pydantic import BaseModel
class WishlistItemCreate(BaseModel):
    product_id: int

@router.post("/wishlist/items")
async def add_wishlist_item(session: SessionDep, current_user_id: CurrentUserId, item_in: WishlistItemCreate) -> Any:
    # Check product exists
    product = await session.get(Product, item_in.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get or create wishlist
    statement = select(Wishlist).where(Wishlist.user_id == current_user_id)
    wishlist = (await session.exec(statement)).first()
    
    if not wishlist:
        wishlist = Wishlist(user_id=current_user_id)
        session.add(wishlist)
        await session.commit()
        await session.refresh(wishlist)
        
    # Check if already exists
    statement = select(WishlistItem).where(
        WishlistItem.wishlist_id == wishlist.id,
        WishlistItem.product_id == item_in.product_id
    )
    existing_item = (await session.exec(statement)).first()
    if existing_item:
        return {"message": "Item already in wishlist"}
        
    # Add new item
    new_item = WishlistItem(wishlist_id=wishlist.id, product_id=item_in.product_id)
    session.add(new_item)
    await session.commit()
    
    await invalidate_cache("admin:wishlist_stats")
    return {"message": "Item added to wishlist"}

@router.delete("/wishlist/items/{product_id}")
async def remove_wishlist_item(session: SessionDep, current_user_id: CurrentUserId, product_id: int) -> Any:
    statement = select(Wishlist).where(Wishlist.user_id == current_user_id)
    wishlist = (await session.exec(statement)).first()
    
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")
        
    statement = select(WishlistItem).where(
        WishlistItem.wishlist_id == wishlist.id,
        WishlistItem.product_id == product_id
    )
    item = (await session.exec(statement)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")
        
    await session.delete(item)
    await session.commit()
    
    await invalidate_cache("admin:wishlist_stats")
    return {"message": "Item removed from wishlist"}

@router.get("/admin/wishlist/stats")
async def get_wishlist_stats(session: SessionDep) -> Any:
    cache_key = "admin:wishlist_stats"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    # total wishlisted count per product (top 10)
    statement = (
        select(WishlistItem.product_id, Product.name, func.count(WishlistItem.id).label("count"))
        .join(Product, WishlistItem.product_id == Product.id)
        .group_by(WishlistItem.product_id, Product.name)
        .order_by(func.count(WishlistItem.id).desc())
        .limit(10)
    )
    results = (await session.exec(statement)).all()
    
    top_products = [{"product_id": r.product_id, "product_name": r.name, "wishlisted_count": r.count} for r in results]
    
    await set_cache(cache_key, top_products, ttl=300)
    return top_products
