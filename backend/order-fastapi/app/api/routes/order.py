from decimal import Decimal

from fastapi import APIRouter, HTTPException
from sqlmodel import col, func, select
from app.api.deps import SessionDep
from app.models.order import (
    Order,
    OrderCreate,
    OrderPublic,
    OrderUpdate,
    OrdersPublic,
)
from app.models.order_item import OrderItem, OrderItemPublic


import json
from fastapi import APIRouter, HTTPException
from sqlmodel import col, func, select
from app.api.deps import SessionDep
from app.models.order import (
    Order,
    OrderCreate,
    OrderPublic,
    OrderUpdate,
    OrdersPublic,
)
from app.models.order_item import OrderItem, OrderItemPublic
from app.core.services import ProductService, InventoryService

router = APIRouter(tags=["order"])

@router.post("/orders", response_model=OrderPublic)
async def create_order(session: SessionDep, order_in: OrderCreate):
    # Securely calculate total amount by fetching real product prices
    calculated_items = []
    total = Decimal("0")
    
    for item_in in order_in.items:
        try:
            real_price = ProductService.get_product_price(item_in.product_id)
            calculated_items.append({
                "product_id": item_in.product_id,
                "quantity": item_in.quantity,
                "unit_price": real_price
            })
            total += real_price * item_in.quantity
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    # Securely reserve inventory
    reserved_items = []
    for item_data in calculated_items:
        try:
            InventoryService.reserve(item_data["product_id"], item_data["quantity"])
            reserved_items.append(item_data)
        except ValueError as e:
            # Rollback previously reserved items
            for res_item in reserved_items:
                InventoryService.release(res_item["product_id"], res_item["quantity"])
            raise HTTPException(status_code=400, detail=str(e))
        except RuntimeError as e:
            for res_item in reserved_items:
                InventoryService.release(res_item["product_id"], res_item["quantity"])
            raise HTTPException(status_code=500, detail=str(e))

    # Securely commit inventory since reservation succeeded and increment product sales
    for item_data in calculated_items:
        InventoryService.commit(item_data["product_id"], item_data["quantity"])
        ProductService.increment_sales(item_data["product_id"], item_data["quantity"])

    order = Order(
        user_id=order_in.user_id,
        shipping_address=order_in.shipping_address,
        total_amount=total,
    )
    session.add(order)
    session.commit()
    session.refresh(order)

    for item_data in calculated_items:
        order_item = OrderItem(
            order_id=order.id,  # type: ignore
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
        )
        session.add(order_item)

    session.commit()
    session.refresh(order)
    return order


@router.get("/orders", response_model=OrdersPublic)
async def read_orders(session: SessionDep, skip: int = 0, limit: int = 100):
    count = session.exec(select(func.count()).select_from(Order)).one()
    statement = (
        select(Order)
        .order_by(col(Order.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    orders = session.exec(statement).all()
    orders_public = [OrderPublic.model_validate(order) for order in orders]
    return OrdersPublic(data=orders_public, count=count)


@router.get("/orders/user/{user_id}", response_model=OrdersPublic)
async def read_orders_by_user(
    session: SessionDep, user_id: str, skip: int = 0, limit: int = 100
):
    count_statement = (
        select(func.count()).select_from(Order).where(Order.user_id == user_id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Order)
        .where(Order.user_id == user_id)
        .order_by(col(Order.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    orders = session.exec(statement).all()
    orders_public = [OrderPublic.model_validate(order) for order in orders]
    return OrdersPublic(data=orders_public, count=count)


@router.get("/orders/{order_id}", response_model=OrderPublic)
async def read_order(session: SessionDep, order_id: int):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(
            status_code=404, detail=f"Order with id: {order_id} not found"
        )
    return order


@router.get("/orders/{order_id}/items", response_model=list[OrderItemPublic])
async def read_order_items(session: SessionDep, order_id: int):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(
            status_code=404, detail=f"Order with id: {order_id} not found"
        )
    statement = select(OrderItem).where(OrderItem.order_id == order_id)
    items = session.exec(statement).all()
    return items


@router.put("/orders/{order_id}", response_model=OrderPublic)
async def update_order(
    session: SessionDep, order_id: int, order_in: OrderUpdate
):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(
            status_code=404, detail=f"Order with id: {order_id} not found"
        )
    update_dict = order_in.model_dump(exclude_unset=True)
    _ = order.sqlmodel_update(update_dict)
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


@router.delete("/orders/{order_id}")
async def delete_order(session: SessionDep, order_id: int):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(
            status_code=404, detail=f"Order with id: {order_id} not found"
        )
    session.delete(order)
    session.commit()
    return {"message": "Order deleted successfully"}
