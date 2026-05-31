"""initial

Revision ID: 01
Revises: 
Create Date: 2026-05-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel

revision = '01'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table('carts',
    sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id')
    )
    op.create_table('cart_items',
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('cart_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['cart_id'], ['carts.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('cart_items')
    op.drop_table('carts')
