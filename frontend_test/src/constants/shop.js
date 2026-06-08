import { shopApi } from '../api/client';

export const USER_ID = shopApi.defaultUserId;
export const PAGE_SIZE = 6;

export const priceRanges = [
  { value: 'all', label: 'Tất cả', min: 0, max: Infinity },
  { value: 'under-10', label: 'Dưới 10 triệu', min: 0, max: 10000000 },
  { value: '10-25', label: '10 - 25 triệu', min: 10000000, max: 25000000 },
  { value: '25-35', label: '25 - 35 triệu', min: 25000000, max: 35000000 },
  { value: 'over-35', label: 'Trên 35 triệu', min: 35000000, max: Infinity },
];

export const statusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'sold', label: 'Bán chạy' },
];

export const initialFilters = {
  search: '',
  categoryId: 'all',
  brand: 'all',
  priceRange: 'all',
  stockOnly: false,
  rating: 0,
};

export const initialCheckoutForm = {
  fullName: 'Nguyễn Minh Long',
  phone: '0987654321',
  address: 'Số 12 Nguyễn Trãi',
  ward: 'Thanh Xuân Trung',
  district: 'Thanh Xuân',
  city: 'Hà Nội',
  note: '',
};
