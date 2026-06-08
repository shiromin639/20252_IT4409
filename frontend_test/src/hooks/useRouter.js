import { useEffect, useMemo, useState } from 'react';

function readLocation() {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
  };
}

export function useRouter() {
  const [location, setLocation] = useState(readLocation);

  useEffect(() => {
    function handlePopState() {
      setLocation(readLocation());
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(path) {
    window.history.pushState({}, '', path);
    setLocation(readLocation());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const route = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);

    if (segments.length === 0) {
      return { name: 'home', params: {} };
    }

    if (segments[0] === 'products' && segments[1]) {
      return { name: 'productDetail', params: { productId: Number(segments[1]) } };
    }

    if (segments[0] === 'products') {
      return { name: 'products', params: {} };
    }

    if (segments[0] === 'cart') {
      return { name: 'cart', params: {} };
    }

    if (segments[0] === 'checkout') {
      return { name: 'checkout', params: {} };
    }

    if (segments[0] === 'orders' && segments[1]) {
      return { name: 'orderDetail', params: { orderId: Number(segments[1]) } };
    }

    if (segments[0] === 'orders') {
      return { name: 'orders', params: {} };
    }

    if (segments[0] === 'login') {
      return { name: 'login', params: {} };
    }

    if (segments[0] === 'profile') {
      return { name: 'profile', params: {} };
    }

    return { name: 'notFound', params: {} };
  }, [location.pathname]);

  return {
    location,
    navigate,
    route,
  };
}
