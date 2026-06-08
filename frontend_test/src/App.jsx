import { useEffect, useState } from 'react';
import { shopApi } from './api/client';
import Header from './components/layout/Header';
import {
  initialCheckoutForm,
  initialFilters,
  USER_ID,
} from './constants/shop';
import { initialOrders } from './data/mockData';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import { useRatings } from './hooks/useRatings';
import { useRouter } from './hooks/useRouter';
import { useStorefront } from './hooks/useStorefront';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrdersPage from './pages/OrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductsPage from './pages/ProductsPage';
import ProfilePage from './pages/ProfilePage';
import {
  buildOrderItems,
  buildShippingAddress,
  createLocalOrder,
} from './utils/orders';

function App() {
  const [orders, setOrders] = useState(initialOrders);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [checkoutForm, setCheckoutForm] = useState(initialCheckoutForm);

  const { location, navigate, route } = useRouter();
  const { login, logout, register, user } = useAuth();
  const {
    apiMode,
    categories,
    products,
    selectedProductId,
    setSelectedProductId,
  } = useStorefront();

  const {
    addToCart,
    appliedVoucher,
    cartCount,
    cartLines,
    clearCart,
    removeCartItem,
    setAppliedVoucher,
    summary,
    updateQuantity,
  } = useCart(products);

  const {
    ratingDrafts,
    ratings,
    setRatingDrafts,
    submitRating,
  } = useRatings();

  useEffect(() => {
    setPage(1);
  }, [filters, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');

    if (route.name === 'products' && category) {
      setFilters((current) => ({ ...current, categoryId: category }));
    }
  }, [location.search, route.name]);

  async function placeOrder(event) {
    event.preventDefault();
    setCheckoutError('');

    if (!checkoutForm.fullName.trim() || !checkoutForm.phone.trim() || !checkoutForm.address.trim()) {
      setCheckoutError('Vui lòng nhập họ tên, số điện thoại và địa chỉ.');
      return;
    }

    const shippingAddress = buildShippingAddress(checkoutForm);
    const items = buildOrderItems(cartLines);

    setPlacingOrder(true);

    try {
      let createdOrder = null;

      try {
        createdOrder = await shopApi.createOrder({
          user_id: USER_ID,
          shipping_address: shippingAddress,
          items,
        });
      } catch {
        createdOrder = null;
      }

      const localOrder = createLocalOrder({
        appliedVoucher,
        createdOrder,
        items,
        paymentMethod,
        shippingAddress,
        summary,
        userId: USER_ID,
      });

      setOrders((current) => [localOrder, ...current]);
      clearCart();
      navigate(`/orders/${localOrder.id}`);
    } finally {
      setPlacingOrder(false);
    }
  }

  const productPageProps = {
    apiMode,
    categories,
    filters,
    navigate,
    onAddToCart: addToCart,
    page,
    products,
    ratings,
    selectedProductId,
    setFilters,
    setPage,
    setSelectedProductId,
    setSortBy,
    sortBy,
  };

  const orderProps = {
    navigate,
    orders,
    products,
    ratingDrafts,
    ratings,
    setRatingDrafts,
    submitRating,
  };

  function renderPage() {
    if (route.name === 'home') {
      return (
        <HomePage
          categories={categories}
          navigate={navigate}
          onAddToCart={addToCart}
          products={products}
          summary={summary}
        />
      );
    }

    if (route.name === 'products') {
      return <ProductsPage {...productPageProps} />;
    }

    if (route.name === 'productDetail') {
      return (
        <ProductDetailPage
          categories={categories}
          navigate={navigate}
          onAddToCart={addToCart}
          productId={route.params.productId}
          products={products}
          ratings={ratings}
        />
      );
    }

    if (route.name === 'cart') {
      return (
        <CartPage
          appliedVoucher={appliedVoucher}
          cartLines={cartLines}
          clearCart={clearCart}
          onCheckout={() => navigate('/checkout')}
          onContinueShopping={() => navigate('/products')}
          removeCartItem={removeCartItem}
          setAppliedVoucher={setAppliedVoucher}
          summary={summary}
          updateQuantity={updateQuantity}
        />
      );
    }

    if (route.name === 'checkout') {
      return (
        <CheckoutPage
          appliedVoucher={appliedVoucher}
          cartLines={cartLines}
          checkoutError={checkoutError}
          form={checkoutForm}
          onContinueShopping={() => navigate('/products')}
          paymentMethod={paymentMethod}
          placeOrder={placeOrder}
          placingOrder={placingOrder}
          setAppliedVoucher={setAppliedVoucher}
          setForm={setCheckoutForm}
          setPaymentMethod={setPaymentMethod}
          summary={summary}
        />
      );
    }

    if (route.name === 'orders') {
      return <OrdersPage {...orderProps} />;
    }

    if (route.name === 'orderDetail') {
      return <OrderDetailPage {...orderProps} orderId={route.params.orderId} />;
    }

    if (route.name === 'login') {
      return <AuthPage login={login} navigate={navigate} register={register} />;
    }

    if (route.name === 'profile') {
      return (
        <ProfilePage
          logout={logout}
          navigate={navigate}
          orders={orders}
          summary={summary}
          user={user}
        />
      );
    }

    return <NotFoundPage navigate={navigate} />;
  }

  return (
    <div className="app-shell">
      <Header
        cartCount={cartCount}
        currentPath={location.pathname}
        filters={filters}
        logout={logout}
        navigate={navigate}
        setFilters={setFilters}
        user={user}
      />

      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
