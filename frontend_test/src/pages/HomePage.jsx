import { ArrowRight, BadgePercent, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import ProductCard from '../components/catalog/ProductCard';
import { formatMoney } from '../utils/formatters';

function HomePage({ categories, navigate, onAddToCart, products, summary }) {
  const featuredProducts = products.slice(0, 4);
  const bestSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 4);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div>
          <span className="status-pill live">TechMall</span>
          <h1>Mua laptop và phụ kiện công nghệ</h1>
          <p>Catalog, giỏ hàng, voucher, thanh toán, đơn hàng và rating đã sẵn sàng để nối backend.</p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => navigate('/products')}>
              Xem sản phẩm
              <ArrowRight size={18} />
            </button>
            <button className="ghost-button" type="button" onClick={() => navigate('/orders')}>
              Theo dõi đơn
            </button>
          </div>
        </div>
        <div className="hero-metrics">
          <div>
            <strong>{products.length}</strong>
            <span>Sản phẩm</span>
          </div>
          <div>
            <strong>{categories.length}</strong>
            <span>Danh mục</span>
          </div>
          <div>
            <strong>{formatMoney(summary.total)}</strong>
            <span>Giỏ hiện tại</span>
          </div>
        </div>
      </section>

      <section className="policy-band">
        <div>
          <Truck size={22} />
          <span>Giao hàng nhanh</span>
        </div>
        <div>
          <ShieldCheck size={22} />
          <span>Bảo hành chính hãng</span>
        </div>
        <div>
          <BadgePercent size={22} />
          <span>Voucher tự động</span>
        </div>
        <div>
          <PackageCheck size={22} />
          <span>Theo dõi đơn hàng</span>
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <div>
            <h1>Danh mục</h1>
            <p>Đi thẳng vào nhóm sản phẩm bạn cần</p>
          </div>
        </div>
        <div className="category-strip">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => navigate(`/products?category=${category.id}`)}
            >
              <strong>{category.name}</strong>
              <span>Xem catalog</span>
            </button>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <div>
            <h1>Nổi bật</h1>
            <p>Sản phẩm được chọn cho storefront</p>
          </div>
          <button className="ghost-button" type="button" onClick={() => navigate('/products')}>
            Xem tất cả
          </button>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={() => onAddToCart(product.id, 1)}
              onSelect={() => navigate(`/products/${product.id}`)}
            />
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <div>
            <h1>Bán chạy</h1>
            <p>Ưu tiên theo số lượng đã bán</p>
          </div>
        </div>
        <div className="product-grid">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={() => onAddToCart(product.id, 1)}
              onSelect={() => navigate(`/products/${product.id}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
