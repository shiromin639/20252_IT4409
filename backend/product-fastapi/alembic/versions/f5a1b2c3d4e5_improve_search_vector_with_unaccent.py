"""improve search_vector with unaccent

Revision ID: f5a1b2c3d4e5
Revises: eae918a332ab
Create Date: 2026-06-04 14:19:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'f5a1b2c3d4e5'
down_revision: Union[str, Sequence[str], None] = 'eae918a332ab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS unaccent")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    
    # 2. Create immutable wrapper function for unaccent
    op.execute("""
    CREATE OR REPLACE FUNCTION f_unaccent(text) RETURNS text AS $$
    SELECT public.unaccent('public.unaccent', $1)
    $$ LANGUAGE sql IMMUTABLE;
    """)
    
    # 3. Drop old computed column and index
    op.drop_index('ix_products_search_vector', table_name='products')
    op.drop_column('products', 'search_vector')
    
    # 4. Recreate the computed column with the new logic
    op.add_column('products', sa.Column('search_vector', postgresql.TSVECTOR(), sa.Computed("to_tsvector('simple', f_unaccent(coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, '')))", persisted=True), nullable=True))
    op.create_index('ix_products_search_vector', 'products', ['search_vector'], unique=False, postgresql_using='gin')


def downgrade() -> None:
    # Reverse the operations
    op.drop_index('ix_products_search_vector', table_name='products')
    op.drop_column('products', 'search_vector')
    
    op.add_column('products', sa.Column('search_vector', postgresql.TSVECTOR(), sa.Computed("to_tsvector('english', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, ''))", persisted=True), nullable=True))
    op.create_index('ix_products_search_vector', 'products', ['search_vector'], unique=False, postgresql_using='gin')
    
    op.execute("DROP FUNCTION IF EXISTS f_unaccent(text)")
