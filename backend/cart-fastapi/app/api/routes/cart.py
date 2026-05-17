from fastapi import APIRouter, HTTPException
from sqlmodel import select
from app.api.deps import SessionDep
from app.models.cart import Cart, CartPublic
from app.models.cart_item import (
    CartItem,
    CartItemAdd,
    CartItemPublic,
    CartItemUpdate,
)


router = APIRouter(tags=["cart"])


@router.post("/carts/{user_id}/items", response_model=CartItemPublic)
async def add_item_to_cart(
    session: SessionDep, user_id: str, item_in: CartItemAdd
):
    statement = select(Cart).where(Cart.user_id == user_id)
    cart = session.exec(statement).first()
    if not cart:
        cart = Cart(user_id=user_id)
        session.add(cart)
        session.commit()
        session.refresh(cart)

    statement = (
        select(CartItem)
        .where(CartItem.cart_id == cart.id)
        .where(CartItem.product_id == item_in.product_id)
    )
    existing_item = session.exec(statement).first()

    if existing_item:
        existing_item.quantity += item_in.quantity
        session.add(existing_item)
        session.commit()
        session.refresh(existing_item)
        return existing_item

    cart_item = CartItem(
        cart_id=cart.id,  # type: ignore
        product_id=item_in.product_id,
        quantity=item_in.quantity,
    )
    session.add(cart_item)
    session.commit()
    session.refresh(cart_item)
    return cart_item


@router.get("/carts/{user_id}", response_model=CartPublic)
async def get_cart(session: SessionDep, user_id: str):
    statement = select(Cart).where(Cart.user_id == user_id)
    cart = session.exec(statement).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart


@router.get("/carts/{user_id}/items", response_model=list[CartItemPublic])
async def get_cart_items(session: SessionDep, user_id: str):
    statement = select(Cart).where(Cart.user_id == user_id)
    cart = session.exec(statement).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    statement = select(CartItem).where(CartItem.cart_id == cart.id)
    items = session.exec(statement).all()
    return items


@router.put("/carts/{user_id}/items/{product_id}", response_model=CartItemPublic)
async def update_cart_item(
    session: SessionDep,
    user_id: str,
    product_id: int,
    item_in: CartItemUpdate,
):
    statement = select(Cart).where(Cart.user_id == user_id)
    cart = session.exec(statement).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    statement = (
        select(CartItem)
        .where(CartItem.cart_id == cart.id)
        .where(CartItem.product_id == product_id)
    )
    cart_item = session.exec(statement).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    cart_item.quantity = item_in.quantity
    session.add(cart_item)
    session.commit()
    session.refresh(cart_item)
    return cart_item


@router.delete("/carts/{user_id}/items/{product_id}")
async def remove_cart_item(session: SessionDep, user_id: str, product_id: int):
    statement = select(Cart).where(Cart.user_id == user_id)
    cart = session.exec(statement).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    statement = (
        select(CartItem)
        .where(CartItem.cart_id == cart.id)
        .where(CartItem.product_id == product_id)
    )
    cart_item = session.exec(statement).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    session.delete(cart_item)
    session.commit()
    return {"message": "Item removed from cart"}


@router.delete("/carts/{user_id}")
async def clear_cart(session: SessionDep, user_id: str):
    statement = select(Cart).where(Cart.user_id == user_id)
    cart = session.exec(statement).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    session.delete(cart)
    session.commit()
    return {"message": "Cart cleared"}
