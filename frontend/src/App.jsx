import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsAuthenticated } from './store/authSlice'
import { fetchCart } from './store/cartSlice'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import { ProtectedRoute, ErrorBoundary } from './components/common'

// Pages
import HomePage from './pages/Home/HomePage'
import ProductsPage from './pages/Products/ProductsPage'
import ProductDetailPage from './pages/ProductDetail/ProductDetailPage'
import CartPage from './pages/Cart/CartPage'
import CheckoutPage from './pages/Checkout/CheckoutPage'
import AuthPage from './pages/Auth/AuthPage'
import ProfilePage from './pages/Profile/ProfilePage'
import PaymentReturnPage from './pages/Payment/PaymentReturnPage'
import AdminDashboard, {
  AdminHome,
  AdminProducts,
  AdminOrders,
  AdminUsers,
} from './pages/Admin/AdminDashboard'

// Static Pages (Information & Policies)
import AboutPage from './pages/Information/AboutPage'
import WarrantyPage from './pages/Information/WarrantyPage'
import PromotionsPage from './pages/Information/PromotionsPage'
import InstallmentPage from './pages/Information/InstallmentPage'
import SupportPage from './pages/Information/SupportPage'
import NewsPage from './pages/Information/NewsPage'
import StoresPage from './pages/Information/StoresPage'
import CareersPage from './pages/Information/CareersPage'
import PartnershipPage from './pages/Information/PartnershipPage'

import ReturnPolicyPage from './pages/Policies/ReturnPolicyPage'
import ShippingPolicyPage from './pages/Policies/ShippingPolicyPage'
import PrivacyPolicyPage from './pages/Policies/PrivacyPolicyPage'
import PaymentGuidePage from './pages/Policies/PaymentGuidePage'


export default function App() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart())
    }
  }, [dispatch, isAuthenticated])

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            {/* Public routes wrapped in Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />

              {/* Auth */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />

              {/* Static Content Routes */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<PartnershipPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/stores" element={<StoresPage />} />
              <Route path="/warranty" element={<WarrantyPage />} />
              <Route path="/promotions" element={<PromotionsPage />} />
              <Route path="/installment" element={<InstallmentPage />} />
              <Route path="/support" element={<SupportPage />} />
              
              <Route path="/policy/warranty" element={<WarrantyPage />} />
              <Route path="/policy/return" element={<ReturnPolicyPage />} />
              <Route path="/policy/shipping" element={<ShippingPolicyPage />} />
              <Route path="/policy/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/policy/payment" element={<PaymentGuidePage />} />

              {/* Protected user routes */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/vnpay/return"
                element={
                  <ProtectedRoute>
                    <PaymentReturnPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminHome />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  )
}
