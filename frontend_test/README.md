# TechMall frontend test

React/Vite frontend cho các luồng backend hiện có:

- Products/Categories: xem danh sách, lọc, sắp xếp, pagination, xem chi tiết.
- Cart: thêm sản phẩm, cập nhật số lượng, xóa từng item, xóa giỏ.
- Checkout/Orders: tạo đơn hàng theo payload `OrderCreate`.
- Inventory: frontend đã có chỗ gọi theo product id, hiện chủ yếu hiển thị tồn kho từ dữ liệu sản phẩm.
- Voucher/Rating: backend chưa có endpoint riêng, nên đang xử lý local. Rating chỉ mở với đơn `delivered`.
- Pages: `/`, `/products`, `/products/:id`, `/cart`, `/checkout`, `/orders`, `/orders/:id`, `/login`, `/profile`.

Chạy local:

```bash
npm install
npm run dev
```

Nếu backend đang chạy, đặt các biến môi trường:

```bash
VITE_PRODUCT_API_URL=http://localhost:<product-port>
VITE_CART_API_URL=http://localhost:<cart-port>
VITE_ORDER_API_URL=http://localhost:<order-port>
VITE_INVENTORY_API_URL=http://localhost:<inventory-port>
```

Không đặt biến môi trường thì app tự dùng mock fallback để xem đầy đủ UI.

## Folder structure

```txt
src/
  api/                 # client gọi product/cart/order/inventory service
  components/
    cart/              # giỏ hàng và quantity stepper
    catalog/           # listing, filter, card, detail, media
    checkout/          # form thanh toán, voucher, tổng đơn
    layout/            # header/navigation
    orders/            # lịch sử đơn và rating
  constants/           # config UI, trạng thái, filter mặc định
  data/                # mock fallback khi backend chưa chạy
  hooks/               # storefront/cart/rating state
  pages/               # route-level pages
  utils/               # format tiền, normalize API, voucher, order payload
```
