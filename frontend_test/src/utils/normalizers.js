import {
  categories as mockCategories,
  products as mockProducts,
} from '../data/mockData';

export function normalizeProduct(product, index = 0) {
  const fallback = mockProducts[index % mockProducts.length];
  const matchedMock = mockProducts.find((item) => Number(item.id) === Number(product.id));
  const base = matchedMock || fallback;

  return {
    id: Number(product.id ?? base.id),
    name: product.name || product.title || base.name,
    slug: product.slug || base.slug,
    sku: product.sku || base.sku,
    brand: product.brand || product.specifications?.brand || product.specifications?.Brand || base.brand,
    category_id: Number(product.category_id ?? base.category_id),
    description: product.description || base.description,
    price: Number(product.price ?? base.price),
    original_price: product.original_price ? Number(product.original_price) : base.original_price,
    stock: Number(product.stock ?? base.stock),
    sold: Number(product.sold ?? base.sold),
    rating: Number(product.rating ?? base.rating),
    image: product.image || base.image,
    visual: product.visual || base.visual,
    specifications: product.specifications || base.specifications || {},
    is_active: product.is_active ?? true,
    created_at: product.created_at || base.created_at || new Date().toISOString(),
  };
}

export function normalizeCategory(category, index = 0) {
  const fallback = mockCategories[index % mockCategories.length];

  return {
    id: Number(category.id ?? fallback.id),
    name: category.name || fallback.name,
    slug: category.slug || fallback.slug,
  };
}

export function getResponseData(response, fallback) {
  if (!response) {
    return fallback;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : fallback;
}
