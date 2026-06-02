export const formatPrice = (price) => {
  if (price >= 1000000) {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

export const formatPriceShort = (price) => {
  if (price >= 1000000000) return (price / 1000000000).toFixed(1) + ' tỷ'
  if (price >= 1000000) return (price / 1000000).toFixed(0) + ' triệu'
  return formatPrice(price)
}

export const calculateDiscount = (original, current) => {
  return Math.round(((original - current) / original) * 100)
}

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const getStatusLabel = (status) => {
  const map = {
    pending: { label: 'Chờ xác nhận', color: 'warning' },
    confirmed: { label: 'Đã xác nhận', color: 'primary' },
    processing: { label: 'Đang xử lý', color: 'primary' },
    shipped: { label: 'Đang giao hàng', color: 'primary' },
    shipping: { label: 'Đang giao hàng', color: 'primary' },
    delivered: { label: 'Hoàn thành', color: 'success' },
    cancelled: { label: 'Đã hủy', color: 'danger' },
  }
  return map[status] || { label: status, color: 'muted' }
}

export const truncate = (str, maxLen = 60) => {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen).trim() + '...'
}
