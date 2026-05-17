import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Shield, Truck, HeadphonesIcon, Star, Clock } from 'lucide-react'
import { productService, usedProductService } from '../../services/api'
import { brands, banners } from '../../data/laptops'
import ProductCard from '../../components/product/ProductCard'
import { SkeletonCard } from '../../components/common'
import { formatPrice } from '../../utils'
import styles from './Home.module.css'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [newProducts, setNewProducts] = useState([])
  const [flashSale, setFlashSale] = useState([])
  const [usedProducts, setUsedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [flashTime, setFlashTime] = useState({ h: 5, m: 42, s: 17 })
  const navigate = useNavigate()
  const bannerInterval = useRef(null)

  useEffect(() => {
    const fetchAll = async () => {
      const [f, n, fs, u] = await Promise.all([
        productService.getFeatured(),
        productService.getNew(),
        productService.getFlashSale(),
        usedProductService.getHotDeals(),
      ])
      setFeatured(f)
      setNewProducts(n)
      setFlashSale(fs)
      setUsedProducts(u)
      setLoading(false)
    }
    fetchAll()
  }, [])

  // Auto-slide banner
  useEffect(() => {
    bannerInterval.current = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(bannerInterval.current)
  }, [])

  // Flash sale countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashTime(prev => {
        let { h, m, s } = prev
        s -= 1
        if (s < 0) { s = 59; m -= 1 }
        if (m < 0) { m = 59; h -= 1 }
        if (h < 0) return { h: 5, m: 59, s: 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const banner = banners[currentBanner]

  return (
    <div className={styles.page}>
      {/* ── HERO BANNER ── */}
      <section className={styles.hero} style={{ background: banner.bg }}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <div className={styles.heroTag} style={{ color: banner.accent, borderColor: banner.accent }}>
              {banner.tag}
            </div>
            <h1 className={styles.heroTitle}>{banner.title}</h1>
            <p className={styles.heroSubtitle}>{banner.subtitle}</p>
            <div className={styles.heroActions}>
              <Link to={banner.href} className="btn btn-primary btn-lg"
                style={{ background: banner.accent, borderColor: banner.accent }}>
                {banner.cta} <ArrowRight size={16} />
              </Link>
              <Link to="/products" className={`btn btn-lg ${styles.heroBtnSecondary}`}>
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img src={banner.image} alt={banner.title} />
            <div className={styles.heroGlow} style={{ background: banner.accent }} />
          </div>
        </div>

        {/* Indicators */}
        <div className={styles.bannerDots}>
          {banners.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === currentBanner ? styles.dotActive : ''}`}
              onClick={() => setCurrentBanner(i)}
            />
          ))}
        </div>

        {/* Arrows */}
        <button className={`${styles.bannerArrow} ${styles.bannerArrowLeft}`}
          onClick={() => setCurrentBanner((currentBanner - 1 + banners.length) % banners.length)}>
          <ChevronLeft size={20} />
        </button>
        <button className={`${styles.bannerArrow} ${styles.bannerArrowRight}`}
          onClick={() => setCurrentBanner((currentBanner + 1) % banners.length)}>
          <ChevronRight size={20} />
        </button>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className={styles.trustSection}>
        <div className="container">
          <div className={styles.trustGrid}>
            {[
              { icon: <Shield size={22} />, title: 'Hàng chính hãng 100%', desc: 'Cam kết bảo hành toàn quốc' },
              { icon: <Truck size={22} />, title: 'Miễn phí giao hàng', desc: 'Cho đơn hàng trên 5 triệu' },
              { icon: <HeadphonesIcon size={22} />, title: 'Hỗ trợ 24/7', desc: 'Hotline: 1900 599 912' },
              { icon: <Star size={22} />, title: 'Trả hàng trong 15 ngày', desc: 'Nếu có lỗi từ nhà sản xuất' },
            ].map((item, i) => (
              <div key={i} className={styles.trustItem}>
                <div className={styles.trustIcon}>{item.icon}</div>
                <div>
                  <div className={styles.trustTitle}>{item.title}</div>
                  <div className={styles.trustDesc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDS ── */}
      <section className="section-sm">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Thương hiệu nổi bật</h2>
              <p className="section-subtitle">Chọn hãng laptop bạn yêu thích</p>
            </div>
          </div>
          <div className={styles.brandsGrid}>
            {brands.map(brand => (
              <Link
                key={brand.id}
                to={`/products?brand=${brand.id}`}
                className={styles.brandCard}
              >
                <span className={styles.brandLogo}>{brand.logo}</span>
                <span className={styles.brandName}>{brand.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLASH SALE ── */}
      {flashSale.length > 0 && (
        <section className={`section-sm ${styles.flashSection}`}>
          <div className="container">
            <div className={`section-header ${styles.flashHeader}`}>
              <div className={styles.flashTitleWrap}>
                <Zap size={20} className={styles.flashIcon} />
                <h2 className={styles.flashTitle}>FLASH SALE</h2>
                <div className={styles.countdown}>
                  <div className={styles.countUnit}>
                    <span>{String(flashTime.h).padStart(2,'0')}</span>
                    <label>giờ</label>
                  </div>
                  <span className={styles.countSep}>:</span>
                  <div className={styles.countUnit}>
                    <span>{String(flashTime.m).padStart(2,'0')}</span>
                    <label>phút</label>
                  </div>
                  <span className={styles.countSep}>:</span>
                  <div className={styles.countUnit}>
                    <span>{String(flashTime.s).padStart(2,'0')}</span>
                    <label>giây</label>
                  </div>
                </div>
              </div>
              <Link to="/products?flash=true" className="section-link">
                Xem tất cả <ArrowRight size={14} />
              </Link>
            </div>
            <div className="product-grid">
              {flashSale.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ── */}
      <section className="section-sm">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Sản phẩm nổi bật</h2>
              <p className="section-subtitle">Những laptop được yêu thích nhất</p>
            </div>
            <Link to="/products?sort=popular" className="section-link">
              Xem thêm <ArrowRight size={14} />
            </Link>
          </div>
          <div className="product-grid">
            {loading
              ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
              : featured.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            }
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="section-sm">
        <div className="container">
          <div className={styles.promoBanners}>
            <div className={styles.promoBanner} style={{ background: 'linear-gradient(135deg, #1B4FE8, #4F9CF9)' }}>
              <div className={styles.promoContent}>
                <span className={styles.promoTag}>Gaming</span>
                <h3>Laptop Gaming RTX 4090</h3>
                <p>Chinh phục mọi tựa game</p>
                <Link to="/products?category=gaming" className={styles.promoBtn}>Xem ngay</Link>
              </div>
              <div className={styles.promoImg}>🎮</div>
            </div>
            <div className={styles.promoBanner} style={{ background: 'linear-gradient(135deg, #0D0D0D, #2D2D2D)' }}>
              <div className={styles.promoContent}>
                <span className={styles.promoTag}>Apple</span>
                <h3>MacBook Pro M3</h3>
                <p>Sáng tạo không giới hạn</p>
                <Link to="/products?brand=apple" className={styles.promoBtn}>Khám phá</Link>
              </div>
              <div className={styles.promoImg}>🍎</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="section-sm">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Hàng mới về</h2>
              <p className="section-subtitle">Cập nhật các dòng laptop mới nhất 2024</p>
            </div>
            <Link to="/products?sort=newest" className="section-link">
              Xem thêm <ArrowRight size={14} />
            </Link>
          </div>
          <div className="product-grid">
            {loading
              ? Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)
              : newProducts.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            }
          </div>
        </div>
      </section>

      {/* ── USED LAPTOPS / MÁYLAPTOP CŨ ── */}
      {usedProducts.length > 0 && (
        <section className={`section-sm ${styles.usedSection}`}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">💰 Máy Cũ - Giá Sốc</h2>
                <p className="section-subtitle">Laptop cũ chất lượng giảm tới 40%, bảo hành 3-6 tháng</p>
              </div>
              <Link to="/products?type=used" className="section-link">
                Xem tất cả <ArrowRight size={14} />
              </Link>
            </div>
            <div className="product-grid">
              {usedProducts.map((p, i) => (
                <div key={p.id} className={styles.usedCard}>
                  <ProductCard product={p} index={i} />
                  <div className={styles.usedBadge}>
                    <Clock size={14} />
                    <span>{p.usageTime} sử dụng</span>
                  </div>
                  <div className={styles.conditionBadge} data-condition={p.condition}>
                    {p.condition === 'excellent' && '⭐ Hoàn hảo'}
                    {p.condition === 'good' && '✅ Tốt'}
                    {p.condition === 'fair' && '⚠️ Bình thường'}
                  </div>
                  <div className={styles.warrantyBadge}>
                    🛡️ Bảo hành {p.warranty}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
