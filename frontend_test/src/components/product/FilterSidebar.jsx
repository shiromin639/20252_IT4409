import React from 'react';
import { categories } from '../../data';
import { brands } from '../../data';

const FilterSidebar = ({ selectedCategories, selectedBrands, priceRange, onCategoryChange, onBrandChange, onPriceChange }) => {
  const priceRanges = [
    { label: 'Dưới 20 triệu', min: 0, max: 20000000 },
    { label: '20 - 30 triệu', min: 20000000, max: 30000000 },
    { label: '30 - 40 triệu', min: 30000000, max: 40000000 },
    { label: 'Trên 40 triệu', min: 40000000, max: Infinity }
  ];

  return (
    <aside className="bg-white rounded-xl p-4 shadow-sm space-y-6">
      <div>
        <h3 className="font-bold text-gray-800 mb-3">Danh mục</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-blue-600">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.name)}
                onChange={() => onCategoryChange(cat.name)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{cat.icon} {cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-3">Thương hiệu</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-blue-600">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => onBrandChange(brand)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-3">Khoảng giá</h3>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label key={range.label} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-blue-600">
              <input
                type="radio"
                name="priceRange"
                checked={priceRange?.label === range.label}
                onChange={() => onPriceChange(range)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>{range.label}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-blue-600">
            <input
              type="radio"
              name="priceRange"
              checked={!priceRange}
              onChange={() => onPriceChange(null)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>Tất cả mức giá</span>
          </label>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
