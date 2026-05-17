from datetime import datetime
from sqlmodel import Column, DateTime, SQLModel, Field, text


class InventoryBase(SQLModel):
    product_id: int = Field(unique=True)
    quantity: int = Field(default=0, ge=0)
    reserved_quantity: int = Field(default=0, ge=0)


class Inventory(InventoryBase, table=True):
    __tablename__ = "inventory"  # type: ignore
    id: int | None = Field(default=None, primary_key=True)
    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("now()"),
            server_onupdate=text("now()"),
            nullable=False,
        ),
    )


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(SQLModel):
    delta: int = Field(default=0)


class InventoryTransaction(SQLModel):
    product_id: int
    amount: int = Field(ge=1)


class InventoryPublic(InventoryBase):
    id: int
    updated_at: datetime

    @property
    def available_quantity(self) -> int:
        return self.quantity - self.reserved_quantity
