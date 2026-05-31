import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import styles from './StaticPageLayout.module.css'

export default function StaticPageLayout({ title, breadcrumbs = [], children }) {
  useEffect(() => {
    document.title = `${title} | TechLap`
    window.scrollTo(0, 0)
  }, [title])

  return (
    <div className={styles.page}>
      <div className={`container ${styles.container}`}>
        
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link to="/" className={styles.breadcrumbLink}>Trang chủ</Link>
          {breadcrumbs.map((bc, i) => (
            <span key={i} className={styles.breadcrumbItem}>
              <ChevronRight size={14} className={styles.breadcrumbIcon} />
              {bc.link ? (
                <Link to={bc.link} className={styles.breadcrumbLink}>{bc.label}</Link>
              ) : (
                <span className={styles.breadcrumbCurrent}>{bc.label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Content Wrapper */}
        <main className={styles.contentWrapper}>
          <h1 className={styles.pageTitle}>{title}</h1>
          <div className={styles.content}>
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
