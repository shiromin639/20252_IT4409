import StaticPageLayout from '../../components/layout/StaticPage/StaticPageLayout'

export default function ShippingPolicyPage() {
  const breadcrumbs = [{"label": "Chính sách"}, {"label": "Giao hàng"}]

  return (
    <StaticPageLayout title="Chính sách giao hàng" breadcrumbs={breadcrumbs}>
      
            <h2>1. Giao hàng Hỏa tốc 2H</h2>
            <p>Áp dụng cho các đơn hàng nội thành Hà Nội và TP.HCM. Khách hàng sẽ nhận được sản phẩm trong vòng 2 tiếng kể từ khi chốt đơn.</p>
            <h2>2. Giao hàng toàn quốc (Ship COD)</h2>
            <p>TechLap hợp tác với GHTK, Viettel Post để giao hàng đến 63 tỉnh thành.</p>
            <ul>
                <li>Thời gian giao hàng: 2 - 5 ngày tùy khu vực.</li>
                <li>Khách hàng được kiểm tra hàng trước khi thanh toán (Đồng kiểm).</li>
            </ul>
            <h2>3. Phí vận chuyển</h2>
            <p>Miễn phí vận chuyển cho tất cả đơn hàng Laptop trên toàn quốc.</p>
            
    </StaticPageLayout>
  )
}
