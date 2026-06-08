import { useEffect, useState } from 'react';
import { shopApi } from '../api/client';
import {
  categories as mockCategories,
  products as mockProducts,
} from '../data/mockData';
import {
  getResponseData,
  normalizeCategory,
  normalizeProduct,
} from '../utils/normalizers';

export function useStorefront() {
  const [products, setProducts] = useState(mockProducts.map(normalizeProduct));
  const [categories, setCategories] = useState(mockCategories);
  const [selectedProductId, setSelectedProductId] = useState(mockProducts[0].id);
  const [apiMode, setApiMode] = useState('mock');

  useEffect(() => {
    let cancelled = false;

    async function loadStorefront() {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          shopApi.listProducts({ skip: 0, limit: 100 }),
          shopApi.listCategories({ skip: 0, limit: 100 }),
        ]);

        if (cancelled) {
          return;
        }

        const loadedProducts = getResponseData(productResponse, mockProducts).map(normalizeProduct);
        const loadedCategories = getResponseData(categoryResponse, mockCategories).map(normalizeCategory);

        setProducts(loadedProducts.length ? loadedProducts : mockProducts.map(normalizeProduct));
        setCategories(loadedCategories.length ? loadedCategories : mockCategories);
        setSelectedProductId((current) => current || loadedProducts[0]?.id || mockProducts[0].id);
        setApiMode('live');
      } catch {
        setProducts(mockProducts.map(normalizeProduct));
        setCategories(mockCategories);
        setApiMode('mock');
      }
    }

    loadStorefront();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    apiMode,
    categories,
    products,
    selectedProductId,
    setSelectedProductId,
  };
}
