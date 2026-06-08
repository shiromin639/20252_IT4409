ALTER TABLE products DROP COLUMN search_vector;
ALTER TABLE products ADD COLUMN search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('simple', f_unaccent(coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, '')))
) STORED;
CREATE INDEX ix_products_search_vector ON products USING GIN(search_vector);
