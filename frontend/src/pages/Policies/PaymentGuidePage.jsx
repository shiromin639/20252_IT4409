import StaticPageLayout from '../../components/layout/StaticPage/StaticPageLayout'

export default function PaymentGuidePage() {
  const breadcrumbs = [{"label": "Chính sách"}, {"label": "Thanh toán"}]

  return (
    <StaticPageLayout title="Hướng dẫn thanh toán" breadcrumbs={breadcrumbs}>
      
            <h2>1. Thanh toán tiền mặt (COD)</h2>
            <p>Khách hàng có thể thanh toán tiền mặt trực tiếp tại cửa hàng hoặc thanh toán cho nhân viên giao hàng khi nhận máy tại nhà.</p>
            <h2>2. Chuyển khoản ngân hàng</h2>
            <p>Hỗ trợ chuyển khoản nhanh 24/7 qua mã QR Code. Giao dịch được xác nhận tự động trong vòng 1-3 phút.</p>
            <h2>3. Thanh toán qua thẻ tín dụng/ATM</h2>
            <p>Chấp nhận thẻ Visa, Mastercard, JCB, thẻ ATM nội địa thông qua cổng thanh toán VNPay và ví điện tử MoMo.</p>
            
    </StaticPageLayout>
  )
}
