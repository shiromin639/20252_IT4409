import StaticPageLayout from '../../components/layout/StaticPage/StaticPageLayout'

export default function PrivacyPolicyPage() {
  const breadcrumbs = [{"label": "Chính sách"}, {"label": "Bảo mật"}]

  return (
    <StaticPageLayout title="Bảo mật thông tin" breadcrumbs={breadcrumbs}>
      
            <h2>1. Mục đích thu thập thông tin</h2>
            <p>Chúng tôi thu thập thông tin (tên, số điện thoại, địa chỉ, email) nhằm mục đích xử lý đơn hàng, hỗ trợ bảo hành và gửi thông tin khuyến mãi (nếu khách hàng đồng ý).</p>
            <h2>2. Cam kết bảo mật</h2>
            <p>TechLap cam kết tuyệt đối KHÔNG chia sẻ, bán hoặc rò rỉ thông tin cá nhân của khách hàng cho bất kỳ bên thứ ba nào vì mục đích thương mại.</p>
            <h2>3. Thanh toán an toàn</h2>
            <p>Mọi giao dịch thanh toán qua thẻ tín dụng/ATM đều được mã hóa bằng giao thức SSL và được xử lý bởi các cổng thanh toán uy tín (VNPay, MoMo) đạt chuẩn bảo mật quốc tế.</p>
            
    </StaticPageLayout>
  )
}
