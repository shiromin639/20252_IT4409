import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { products } from '../data';
import ProductCard from '../components/common/ProductCard';
import FilterSidebar from '../components/product/FilterSidebar';
import SortBar from '../components/product/SortBar';

const ProductListing = () => {
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const brandParam = searchParams.get('brand');
  const qParam = searchParams.get('q');

  const [selectedCategories, setSelectedCategories] = useState(
    categoryName ? [categoryName] : []
  );
  const [selectedBrands, setSelectedBrands] = useState(
    brandParam ? [brandParam] : []
  );
  const [priceRange, setPriceRange] = useState(null);
  const [sortBy, setSortBy] = useState('default');

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (qParam) {
      const q = qParam.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    if (priceRange) {
      result = result.filter(
        (p) => p.price >= priceRange.min && p.price < priceRange.max
      );
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'sold':
        result.sort((a, b) => parseFloat(b.sold) - parseFloat(a.sold));
        break;
      default:
        break;
    }

    return result;
  }, [selectedCategories, selectedBrands, priceRange, sortBy, qParam]);

  return (
    <div className="flex gap-6">
      <div className="hidden md:block w-64 shrink-0">
        <FilterSidebar
          selectedCategories={selectedCategories}
          selectedBrands={selectedBrands}
          priceRange={priceRange}
          onCategoryChange={handleCategoryChange}
          onBrandChange={handleBrandChange}
          onPriceChange={setPriceRange}
        />
      </div>

      <div className="flex-1 space-y-4">
        <SortBar
          sortBy={sortBy}
          onSortChange={setSortBy}
          resultCount={filteredProducts.length}
        />

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm text-center">
            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                imageUrl={product.image}
                sold={product.sold}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListing;
