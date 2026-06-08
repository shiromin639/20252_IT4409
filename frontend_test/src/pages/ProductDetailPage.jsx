import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/catalog/ProductCard';
import ProductDetail from '../components/catalog/ProductDetail';

function ProductDetailPage({ categories, navigate, onAddToCart, productId, products, ratings }) {
  const product = products.find((item) => item.id === Number(productId));
  const categoryName = categories.find((category) => category.id === product?.category_id)?.name || 'Sản phẩm';
  const relatedProducts = products
    .filter((item) => item.id !== product?.id && item.category_id === product?.category_id)
    .slice(0, 4);

  if (!product) {
    return (
      <section className="empty-state standalone">
        <h1>Không tìm thấy sản phẩm</h1>
        <button className="primary-button" type="button" onClick={() => navigate('/products')}>
          Quay lại catalog
        </button>
      </section>
    );
  }

  return (
    <div className="product-detail-page">
      <button className="ghost-button" type="button" onClick={() => navigate('/products')}>
        <ArrowLeft size={17} />
        Catalog
      </button>

      <ProductDetail
        product={product}
        categoryName={categoryName}
        ratings={ratings}
        onAddToCart={onAddToCart}
      />

      <section className="page-section">
        <div className="section-heading">
          <div>
            <h1>Sản phẩm liên quan</h1>
            <p>Cùng danh mục {categoryName}</p>
          </div>
        </div>
        <div className="product-grid">
          {relatedProducts.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onAdd={() => onAddToCart(item.id, 1)}
              onSelect={() => navigate(`/products/${item.id}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProductDetailPage;
