import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

const SortBar = ({ sortBy, onSortChange, resultCount }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
      <span className="text-sm text-gray-600">{resultCount} sản phẩm</span>
      <div className="flex items-center gap-3">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500"
        >
          <option value="default">Mặc định</option>
          <option value="price-asc">Giá: Thấp đến cao</option>
          <option value="price-desc">Giá: Cao đến thấp</option>
          <option value="rating">Đánh giá cao nhất</option>
          <option value="sold">Bán chạy nhất</option>
        </select>
      </div>
    </div>
  );
};

export default SortBar;
