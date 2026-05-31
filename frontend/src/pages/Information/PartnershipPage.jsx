import StaticPageLayout from '../../components/layout/StaticPage/StaticPageLayout'

export default function PartnershipPage() {
  const breadcrumbs = [{"label": "Thông tin công ty"}, {"label": "Hợp tác"}]

  return (
    <StaticPageLayout title="Liên hệ hợp tác" breadcrumbs={breadcrumbs}>
      
            <h2>1. Hợp tác Doanh nghiệp (B2B)</h2>
            <p>TechLap cung cấp giải pháp thiết bị CNTT toàn diện cho doanh nghiệp với mức chiết khấu cực kỳ ưu đãi, hỗ trợ công nợ linh hoạt và dịch vụ bảo hành tận nơi.</p>
            <h2>2. Hợp tác Truyền thông & Đại lý</h2>
            <p>Chúng tôi luôn chào đón các đối tác truyền thông, KOL/Reviewer công nghệ để cùng hợp tác phát triển thương hiệu.</p>
            <p>Vui lòng liên hệ: b2b@techlap.vn hoặc Hotline: 0999 888 777</p>
            
    </StaticPageLayout>
  )
}
