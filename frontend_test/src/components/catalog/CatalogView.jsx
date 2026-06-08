import { useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { PAGE_SIZE, priceRanges, sortOptions } from '../../constants/shop';
import FilterPanel from './FilterPanel';
import ProductCard from './ProductCard';
import ProductDetail from './ProductDetail';

function CatalogView({
  products,
  categories,
  filters,
  setFilters,
  sortBy,
  setSortBy,
  page,
  setPage,
  selectedProductId,
  setSelectedProductId,
  onAddToCart,
  onOpenProduct,
  ratings,
  apiMode,
  showDetailPanel = true,
}) {
  const brands = useMemo(() => [...new Set(products.map((product) => product.brand))].sort(), [products]);

  const filteredProducts = useMemo(() => {
    const range = priceRanges.find((item) => item.value === filters.priceRange) || priceRanges[0];
    const query = filters.search.trim().toLowerCase();

    const result = products
      .filter((product) => product.is_active)
      .filter((product) => {
        if (!query) {
          return true;
        }

        return [product.name, product.sku, product.brand, product.description]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .filter((product) => filters.categoryId === 'all' || Number(product.category_id) === Number(filters.categoryId))
      .filter((product) => filters.brand === 'all' || product.brand === filters.brand)
      .filter((product) => product.price >= range.min && product.price < range.max)
      .filter((product) => !filters.stockOnly || product.stock > 0)
      .filter((product) => product.rating >= filters.rating);

    return result.sort((a, b) => {
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }

      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }

      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }

      if (sortBy === 'sold') {
        return b.sold - a.sold;
      }

      return b.id - a.id;
    });
  }, [filters, products, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paginatedProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const selectedProduct = products.find((product) => product.id === selectedProductId) || paginatedProducts[0];
  const categoryName = categories.find((category) => category.id === selectedProduct?.category_id)?.name || 'Sản phẩm';

  useEffect(() => {
    if (safePage !== page) {
      setPage(safePage);
    }
  }, [page, safePage, setPage]);

  function handleProductSelect(productId) {
    if (onOpenProduct) {
      onOpenProduct(productId);
      return;
    }

    setSelectedProductId(productId);
  }

  return (
    <div className={showDetailPanel ? 'catalog-view' : 'catalog-view catalog-view-full'}>
      <FilterPanel categories={categories} filters={filters} setFilters={setFilters} brands={brands} />

      <section className="catalog-content">
        <div className="catalog-header">
          <div>
            <span className={apiMode === 'live' ? 'status-pill live' : 'status-pill'}>{apiMode === 'live' ? 'Live API' : 'Mock fallback'}</span>
            <h1>Sản phẩm</h1>
            <p>{filteredProducts.length} kết quả phù hợp</p>
          </div>
          <label className="sort-control">
            <span>Sắp xếp</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {paginatedProducts.length > 0 ? (
          <div className="product-grid">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                selected={selectedProduct?.id === product.id}
                onSelect={() => handleProductSelect(product.id)}
                onAdd={() => onAddToCart(product.id, 1)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state catalog-empty">
            <Search size={32} />
            <p>Không có sản phẩm phù hợp.</p>
          </div>
        )}

        <div className="pagination">
          <button type="button" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            <ChevronLeft size={17} />
          </button>
          <span>
            Trang {safePage}/{pageCount}
          </span>
          <button type="button" disabled={safePage === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>
            <ChevronRight size={17} />
          </button>
        </div>
      </section>

      {showDetailPanel && (
        <ProductDetail product={selectedProduct} categoryName={categoryName} ratings={ratings} onAddToCart={onAddToCart} />
      )}
    </div>
  );
}

export default CatalogView;
