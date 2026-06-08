import React, { useState, useEffect } from 'react';

const FALLBACK_MAP = {
  gaming: '/images/products/gaming.jpg',
  office: '/images/products/office.jpg',
  business: '/images/products/business.jpg',
  workstation: '/images/products/workstation.jpg',
  macbook: '/images/products/macbook.jpg',
};

const getFallbackImage = (category = '', productName = '', brand = '') => {
  const c = category.toLowerCase();
  const p = productName.toLowerCase();
  const b = brand.toLowerCase();

  // 1. Check Gaming
  if (c.includes('gaming') || p.includes('rog') || p.includes('predator') || p.includes('legion') || p.includes('alienware') || p.includes('gaming')) {
    return FALLBACK_MAP.gaming;
  }
  // 2. Check MacBook / Apple
  if (c.includes('macbook') || p.includes('macbook') || b.includes('apple')) {
    return FALLBACK_MAP.macbook;
  }
  // 3. Check Workstation / Creator
  if (c.includes('creator') || c.includes('workstation') || p.includes('workstation') || p.includes('zbook') || p.includes('precision') || p.includes('creator')) {
    return FALLBACK_MAP.workstation;
  }
  // 4. Check Business
  if (c.includes('business') || p.includes('business') || p.includes('thinkpad') || p.includes('latitude') || p.includes('elitebook') || p.includes('probook')) {
    return FALLBACK_MAP.business;
  }
  // 5. Default to Office for everything else (or explicitly Office)
  return FALLBACK_MAP.office;
};

const Image = ({
  src,
  alt = '',
  category = '',
  productName = '',
  brand = '',
  className = '',
  style = {},
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  
  // Re-evaluate src if the prop changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      console.warn(`[Image] Failed to load image: ${src}`);
      const fallback = getFallbackImage(category, productName, brand);
      setImgSrc(fallback);
      setHasError(true);
    }
  };

  // If no source is provided initially, fallback immediately
  const finalSrc = imgSrc || getFallbackImage(category, productName, brand);

  return (
    <img
      src={finalSrc}
      alt={alt}
      onError={handleError}
      className={className}
      style={style}
      loading="lazy"
      {...props}
    />
  );
};

export default Image;
