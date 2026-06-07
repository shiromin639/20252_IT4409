import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface AppContextType {
  user: any;
  setUser: (user: any) => void;
  view: string;
  setView: (view: string) => void;
  selectedProduct: any;
  setSelectedProduct: (product: any) => void;
  selectedOrderId: number | null;
  setSelectedOrderId: (id: number | null) => void;
  cart: any;
  refreshCart: () => Promise<void>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  notification: { message: string; type: 'success' | 'error' | '' };
  showNotification: (message: string, type: 'success' | 'error') => void;
  categories: any[];
  refreshCategories: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState('products');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
  const [categories, setCategories] = useState<any[]>([]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const checkAuth = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
      if (view === 'login') {
        setView(userData.roles?.includes('ROLE_ADMIN') ? 'admin-dashboard' : 'products');
      }
    } catch {
      setUser(null);
    }
  };

  const refreshCart = async () => {
    if (!user) return;
    try {
      const cartData = await api.getCart();
      setCart(cartData);
    } catch (err) {
      console.error("Cart error or empty:", err);
      setCart(null);
    }
  };

  const refreshCategories = async () => {
    try {
      const catRes = await api.getCategories();
      setCategories(catRes.content || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    checkAuth();
    refreshCategories();
  }, []);

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [user]);

  return (
    <AppContext.Provider value={{
      user, setUser,
      view, setView,
      selectedProduct, setSelectedProduct,
      selectedOrderId, setSelectedOrderId,
      cart, refreshCart,
      loading, setLoading,
      notification, showNotification,
      categories, refreshCategories,
      checkAuth
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
