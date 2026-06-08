import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Notification } from './components/Notification';
import { Login } from './pages/Login';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { MyOrders } from './pages/MyOrders';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';
import './index.css';

const AppContent: React.FC = () => {
  const { view } = useApp();

  const renderActiveView = () => {
    switch (view) {
      case 'login':
        return <Login />;
      case 'products':
        return <Products />;
      case 'product-detail':
        return <ProductDetail />;
      case 'cart':
        return <Cart />;
      case 'checkout':
        return <Checkout />;
      case 'my-orders':
        return <MyOrders />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'profile':
        return <Profile />;
      default:
        return <Products />;
    }
  };

  return (
    <>
      <Navbar />
      <main className="app-container">
        {renderActiveView()}
      </main>
      <Notification />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
