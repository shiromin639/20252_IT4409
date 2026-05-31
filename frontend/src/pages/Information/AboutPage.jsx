import StaticPageLayout from '../../components/layout/StaticPage/StaticPageLayout'

export default function AboutPage() {
  const breadcrumbs = [{"label": "Thông tin công ty"}, {"label": "Giới thiệu"}]

  return (
    <StaticPageLayout title="Giới thiệu công ty" breadcrumbs={breadcrumbs}>
      
            <h2>1. Về TechLap</h2>
            <p>TechLap là hệ thống bán lẻ laptop chính hãng hàng đầu tại Việt Nam. Chúng tôi cam kết mang đến cho khách hàng những sản phẩm công nghệ tiên tiến nhất với giá cả hợp lý và dịch vụ hậu mãi xuất sắc.</p>
            <h2>2. Tầm nhìn & Sứ mệnh</h2>
            <p><strong>Tầm nhìn:</strong> Trở thành điểm đến số 1 cho người dùng công nghệ tại Việt Nam.</p>
            <p><strong>Sứ mệnh:</strong> Nâng tầm trải nghiệm công nghệ của người Việt thông qua việc cung cấp các sản phẩm chất lượng cao và dịch vụ tận tâm.</p>
            <h2>3. Giá trị cốt lõi</h2>
            <ul>
                <li>Chất lượng sản phẩm đặt lên hàng đầu</li>
                <li>Tận tâm phục vụ khách hàng</li>
                <li>Liên tục đổi mới và sáng tạo</li>
            </ul>
            
    </StaticPageLayout>
  )
}
