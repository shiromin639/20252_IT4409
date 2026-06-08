import { SlidersHorizontal } from 'lucide-react';
import { priceRanges } from '../../constants/shop';

function FilterPanel({ categories, filters, setFilters, brands }) {
  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <aside className="filter-panel">
      <div className="panel-title">
        <SlidersHorizontal size={18} />
        <h2>Bộ lọc</h2>
      </div>

      <label className="field">
        <span>Danh mục</span>
        <select value={filters.categoryId} onChange={(event) => updateFilter('categoryId', event.target.value)}>
          <option value="all">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Thương hiệu</span>
        <select value={filters.brand} onChange={(event) => updateFilter('brand', event.target.value)}>
          <option value="all">Tất cả thương hiệu</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </label>

      <div className="field">
        <span>Khoảng giá</span>
        <div className="choice-list">
          {priceRanges.map((range) => (
            <button
              key={range.value}
              type="button"
              className={filters.priceRange === range.value ? 'choice active' : 'choice'}
              onClick={() => updateFilter('priceRange', range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <label className="toggle-row">
        <input
          type="checkbox"
          checked={filters.stockOnly}
          onChange={(event) => updateFilter('stockOnly', event.target.checked)}
        />
        <span>Còn hàng</span>
      </label>

      <div className="field">
        <span>Đánh giá tối thiểu</span>
        <div className="rating-filter">
          {[0, 4, 4.5].map((value) => (
            <button
              key={value}
              type="button"
              className={filters.rating === value ? 'rating-pill active' : 'rating-pill'}
              onClick={() => updateFilter('rating', value)}
            >
              {value === 0 ? 'Tất cả' : `${value}+`}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default FilterPanel;
