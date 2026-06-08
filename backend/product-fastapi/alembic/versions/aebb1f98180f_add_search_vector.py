"""Add search_vector

Revision ID: aebb1f98180f
Revises: 7cdee3f7da5a
Create Date: 2026-06-02 13:47:16.390244

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aebb1f98180f'
down_revision: Union[str, Sequence[str], None] = '7cdee3f7da5a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TABLE products ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, ''))) STORED")
    op.create_index('ix_products_search_vector', 'products', ['search_vector'], postgresql_using='gin')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_products_search_vector', table_name='products')
    op.drop_column('products', 'search_vector')
