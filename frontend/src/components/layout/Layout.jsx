import { Outlet, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Phone, MessageCircle } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'
import styles from './Layout.module.css'

export default function Layout() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const isAuthPage = pathname === '/login' || pathname === '/register'

  return (
    <div className={styles.layout}>
      {!isAuthPage && <Navbar />}
      
      <main className={`${styles.main} ${isAdmin ? styles.adminMain : ''}`}>
        <Outlet />
      </main>

      {!isAdmin && !isAuthPage && (
        <>
          <Footer />
          <div className={styles.floatingContact}>
            <a href="tel:18006969" className={`${styles.contactBtn} ${styles.btnCall}`} title="Gọi mua hàng">
              <Phone size={24} />
            </a>
            <a href="#" className={`${styles.contactBtn} ${styles.btnZalo}`} title="Zalo Chat">
              Zalo
            </a>
            <a href="#" className={`${styles.contactBtn} ${styles.btnMessenger}`} title="Messenger">
              <MessageCircle size={24} />
            </a>
          </div>
        </>
      )}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
            boxShadow: 'var(--shadow-lg)',
          },
        }}
      />
    </div>
  )
}
