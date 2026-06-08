import { useEffect, useState } from 'react';

function ProductMedia({ product }) {
  const [showImage, setShowImage] = useState(Boolean(product.image));
  const [background, screen, accent] = product.visual || ['#eef2ff', '#111827', '#0ea5e9'];

  useEffect(() => {
    setShowImage(Boolean(product.image));
  }, [product.id, product.image]);

  if (showImage) {
    return (
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
        onError={() => setShowImage(false)}
      />
    );
  }

  return (
    <div className="product-art" style={{ '--art-bg': background, '--art-screen': screen, '--art-accent': accent }}>
      <div className="device-lid">
        <span />
      </div>
      <div className="device-base" />
    </div>
  );
}

export default ProductMedia;
