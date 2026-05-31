import StaticPageLayout from '../../components/layout/StaticPage/StaticPageLayout'

export default function InstallmentPage() {
  const breadcrumbs = [{"label": "Hỗ trợ"}, {"label": "Trả góp"}]

  return (
    <StaticPageLayout title="Hướng dẫn trả góp" breadcrumbs={breadcrumbs}>
      
            <h2>1. Trả góp qua thẻ tín dụng (0% lãi suất)</h2>
            <p>Chấp nhận thẻ tín dụng của hơn 25 ngân hàng: Vietcombank, Techcombank, VPBank, Sacombank,... Khách hàng chỉ cần có thẻ tín dụng và hạn mức đủ thanh toán giá trị đơn hàng.</p>
            <h2>2. Trả góp qua công ty tài chính</h2>
            <p>Đối tác: Home Credit, HD Saison, FE Credit.</p>
            <ul>
                <li>Độ tuổi: Từ 18 - 60 tuổi</li>
                <li>Thủ tục: CCCD gắn chip (không cần sổ hộ khẩu)</li>
                <li>Duyệt hồ sơ nhanh chóng trong 15 phút</li>
            </ul>
            
    </StaticPageLayout>
  )
}
