// Static non-dynamic constants for UI

export const ramOptions = ['8GB', '16GB', '32GB', '64GB'];

export const priceRanges = [
  { min: 0, max: 15000000, label: 'Dưới 15 triệu' },
  { min: 15000000, max: 25000000, label: '15 - 25 triệu' },
  { min: 25000000, max: 40000000, label: '25 - 40 triệu' },
  { min: 40000000, max: Infinity, label: 'Trên 40 triệu' },
];

export const banners = [
  {
    id: 1,
    title: 'MacBook Pro M3 Series',
    subtitle: 'Sức mạnh bứt phá. Không giới hạn.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2000&auto=format&fit=crop',
    link: '/products?brand=apple'
  },
  {
    id: 2,
    title: 'Gaming Laptop 2024',
    subtitle: 'Chiến game cực đỉnh. Đồ họa mượt mà.',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=2000&auto=format&fit=crop',
    link: '/products?category=gaming'
  }
];
