import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Truck, HeadphonesIcon, Star, Monitor, Cpu, Mouse, Keyboard, Briefcase, ZapIcon } from 'lucide-react'
import { productApi } from '../../services/api'
import ProductCard from '../../components/product/ProductCard'
import { SkeletonCard } from '../../components/common'
import styles from './Home.module.css'

const categories = [
  { name: 'Laptop Gaming', icon: <ZapIcon size={18} />, link: '/products?category=gaming' },
  { name: 'Laptop Văn Phòng', icon: <Briefcase size={18} />, link: '/products?category=office' },
  { name: 'Laptop Đồ Họa', icon: <Monitor size={18} />, link: '/products?category=graphics' },
  { name: 'Ultrabook', icon: <Star size={18} />, link: '/products?category=ultrabook' },
  { name: 'MacBook', icon: <Cpu size={18} />, link: '/products?brand=apple' },
  { name: 'Phụ kiện', icon: <Mouse size={18} />, link: '/products?category=accessories' },
  { name: 'Bàn phím', icon: <Keyboard size={18} />, link: '/products?category=keyboard' },
  { name: 'Màn hình', icon: <Monitor size={18} />, link: '/products?category=monitor' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [gaming, setGaming] = useState([])
  const [office, setOffice] = useState([])
  const [flashSale, setFlashSale] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentBanner, setCurrentBanner] = useState(0)

  const banners = [
    { image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200&q=80', title: 'Siêu Sale Laptop Gaming', subtitle: 'Giảm tới 30%', tag: 'HOT', link: '/products?category=gaming' },
    { image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&q=80', title: 'MacBook Pro M3', subtitle: 'Sức mạnh vượt trội', tag: 'NEW', link: '/products?brand=apple' }
  ]

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [featuredRes, flashRes, gamingRes, officeRes] = await Promise.all([
          productApi.getAll({ limit: 10 }),
          productApi.getAll({ sort: 'price-desc', limit: 5 }), // Simulating flash sale
          productApi.getAll({ category: 'Gaming Laptop', limit: 10 }),
          productApi.getAll({ category: 'Office Laptop', limit: 10 })
        ])
        setFeatured(featuredRes.data)
        setFlashSale(flashRes.data)
        setGaming(gamingRes.data.length > 0 ? gamingRes.data : featuredRes.data.slice(0,5)) // fallback
        setOffice(officeRes.data.length > 0 ? officeRes.data : featuredRes.data.slice(0,5)) // fallback
      } catch (err) {
        console.error("Failed to load home data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners.length])

  return (
    <div className={styles.page}>
      
      {/* ── TOP SECTION (SIDEBAR + HERO) ── */}
      <section className={styles.topSection}>
        <div className={`container ${styles.topLayout}`}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarMenu}>
              {categories.map((cat, i) => (
                <Link key={i} to={cat.link} className={styles.sidebarItem}>
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* Hero Carousel */}
            <div className={styles.hero}>
              <img src={banners[currentBanner].image} className={styles.heroImage} alt="Banner" />
              <div className={styles.heroOverlay}>
                <h1 className={styles.heroTitle}>{banners[currentBanner].title}</h1>
                <p className={styles.heroSubtitle}>{banners[currentBanner].subtitle}</p>
                <Link to={banners[currentBanner].link} className={styles.heroBtn}>
                  Mua Ngay <ArrowRight size={16} />
                </Link>
              </div>
              <div className={styles.heroDots}>
                {banners.map((_, i) => (
                  <div key={i} onClick={() => setCurrentBanner(i)} className={`${styles.dot} ${currentBanner === i ? styles.dotActive : ''}`} />
                ))}
              </div>
            </div>

            {/* Promo Banners (Under Hero) */}
            <div className={styles.promoBanners}>
              <Link to="/products?brand=asus" className={styles.promoCard}>
                <img src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&q=80" alt="Promo" className={styles.promoImg} />
              </Link>
              <Link to="/products?category=gaming" className={styles.promoCard}>
                <img src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80" alt="Promo" className={styles.promoImg} />
              </Link>
              <Link to="/products?category=ultrabook" className={styles.promoCard}>
                <img src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=80" alt="Promo" className={styles.promoImg} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLASH SALE ── */}
      {flashSale.length > 0 && (
        <div className="container">
          <section className={`${styles.productSection} ${styles.flashSection}`}>
            <div className={`${styles.sectionHeader} ${styles.flashHeader}`}>
              <h2 className={styles.flashTitle}>
                <Zap size={24} fill="currentColor" /> GIỜ VÀNG GIÁ SỐC
              </h2>
              <Link to="/products?sort=discount" className={styles.flashLink}>
                Xem tất cả <ArrowRight size={14} />
              </Link>
            </div>
            <div className={styles.productList}>
              {flashSale.slice(0, 5).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        </div>
      )}

      {/* ── SẢN PHẨM NỔI BẬT ── */}
      <div className="container">
        <section className={styles.productSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Sản phẩm nổi bật</h2>
            <Link to="/products?sort=popular" className={styles.sectionLink}>
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className={styles.productList}>
            {loading
              ? Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)
              : featured.slice(0, 10).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            }
          </div>
        </section>
      </div>

      {/* ── LAPTOP GAMING ── */}
      <div className="container">
        <section className={styles.productSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Laptop Gaming</h2>
            <Link to="/products?category=gaming" className={styles.sectionLink}>
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className={styles.productList}>
            {loading
              ? Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)
              : gaming.slice(0, 5).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            }
          </div>
        </section>
      </div>

      {/* ── LAPTOP VĂN PHÒNG ── */}
      <div className="container">
        <section className={styles.productSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Laptop Văn Phòng - Học Tập</h2>
            <Link to="/products?category=office" className={styles.sectionLink}>
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className={styles.productList}>
            {loading
              ? Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)
              : office.slice(0, 5).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            }
          </div>
        </section>
      </div>

      {/* ── TRUST BADGES ── */}
      <div className="container">
        <section className={styles.trustSection}>
          <div className={styles.trustGrid}>
            {[
              { icon: <Shield size={28} />, title: 'Hàng chính hãng 100%', desc: 'Cam kết chất lượng' },
              { icon: <Truck size={28} />, title: 'Bảo hành toàn quốc', desc: 'Tại hệ thống TechLap' },
              { icon: <Star size={28} />, title: 'Đổi trả 15 ngày', desc: 'Lỗi là đổi mới' },
              { icon: <HeadphonesIcon size={28} />, title: 'Hỗ trợ kỹ thuật 24/7', desc: 'Sẵn sàng phục vụ' },
            ].map((item, i) => (
              <div key={i} className={styles.trustItem}>
                <div className={styles.trustIcon}>{item.icon}</div>
                <div className={styles.trustTitle}>{item.title}</div>
                <div className={styles.trustDesc}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  )
}
