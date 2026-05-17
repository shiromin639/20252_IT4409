from fastapi import APIRouter, HTTPException
from sqlmodel import select
from app.api.deps import SessionDep
from app.models.inventory import (
    Inventory,
    InventoryPublic,
    InventoryTransaction,
    InventoryCreate,
    InventoryUpdate,
)


router = APIRouter(tags=["inventory"])


@router.post("/inventory/reserve", response_model=InventoryPublic)
async def reserve_stock(session: SessionDep, transaction: InventoryTransaction):
    statement = (
        select(Inventory)
        .where(Inventory.product_id == transaction.product_id)
        .with_for_update()
    )
    inventory = session.exec(statement).first()
    if not inventory:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id: {transaction.product_id} not found",
        )
    if inventory.quantity - inventory.reserved_quantity < transaction.amount:
        raise HTTPException(status_code=400, detail="Not enough quantity")
    inventory.reserved_quantity += transaction.amount
    session.add(inventory)
    session.commit()
    session.refresh(inventory)
    return inventory


@router.post("/inventory/release", response_model=InventoryPublic)
async def release_stock(session: SessionDep, transaction: InventoryTransaction):
    statement = (
        select(Inventory)
        .where(Inventory.product_id == transaction.product_id)
        .with_for_update()
    )
    inventory = session.exec(statement).first()
    if not inventory:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id: {transaction.product_id} not found",
        )
    inventory.reserved_quantity -= transaction.amount
    session.add(inventory)
    session.commit()
    session.refresh(inventory)
    return inventory


@router.post("/inventory/commit", response_model=InventoryPublic)
async def commit_stock(session: SessionDep, transaction: InventoryTransaction):
    statement = (
        select(Inventory)
        .where(Inventory.product_id == transaction.product_id)
        .with_for_update()
    )
    inventory = session.exec(statement).first()
    if not inventory:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id: {transaction.product_id} not found",
        )

    if inventory.quantity < transaction.amount:
        raise HTTPException(status_code=400, detail="Not enough quantity")
    inventory.quantity -= transaction.amount
    inventory.reserved_quantity -= transaction.amount

    session.add(inventory)
    session.commit()
    session.refresh(inventory)
    return inventory


### Admin
@router.post("/inventory", response_model=InventoryPublic)
async def create_inventory(session: SessionDep, inventory_in: InventoryCreate):
    inventory = Inventory.model_validate(inventory_in)
    session.add(inventory)
    session.commit()
    session.refresh(inventory)
    return inventory


@router.put("/inventory/{product_id}/stock-update", response_model=InventoryPublic)
async def update_stock(
    session: SessionDep, inventory_update: InventoryUpdate, product_id: int
):
    statement = (
        select(Inventory).where(Inventory.product_id == product_id).with_for_update()
    )
    inventory = session.exec(statement).first()
    if not inventory:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id: {product_id} not found",
        )

    if inventory.quantity + inventory_update.delta < 0:
        raise HTTPException(status_code=400, detail="Update amount not valid")

    inventory.quantity += inventory_update.delta
    session.add(inventory)
    session.commit()
    session.refresh(inventory)
    return inventory


@router.get("/inventory/{product_id}", response_model=InventoryPublic)
async def get_available_quantity(session: SessionDep, product_id: int):
    statement = select(Inventory).where(Inventory.product_id == product_id)
    inventory = session.exec(statement).first()
    if not inventory:
        raise HTTPException(
            status_code=404, detail=f"Product with id: {product_id} not found"
        )

    return inventory
