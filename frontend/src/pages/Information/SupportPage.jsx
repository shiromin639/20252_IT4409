import StaticPageLayout from '../../components/layout/StaticPage/StaticPageLayout'

export default function SupportPage() {
  const breadcrumbs = [{"label": "Hỗ trợ"}, {"label": "Kỹ thuật"}]

  return (
    <StaticPageLayout title="Hỗ trợ kỹ thuật" breadcrumbs={breadcrumbs}>
      
            <h2>1. Tổng đài hỗ trợ</h2>
            <p>Hotline kỹ thuật: <strong>1800 6970</strong> (Hoạt động từ 8:00 - 21:00 hàng ngày).</p>
            <h2>2. Dịch vụ hỗ trợ từ xa</h2>
            <p>TechLap cung cấp dịch vụ hỗ trợ cài đặt phần mềm, kiểm tra lỗi qua UltraViewer/TeamViewer hoàn toàn miễn phí cho khách hàng mua máy tại hệ thống.</p>
            <h2>3. Câu hỏi thường gặp (FAQ)</h2>
            <ul>
                <li><strong>Máy không lên nguồn:</strong> Kiểm tra lại sạc và ổ cắm. Nhấn giữ nút nguồn 30s để hard reset.</li>
                <li><strong>Lỗi Windows:</strong> Có thể mang máy đến cửa hàng để được hỗ trợ cài lại Win miễn phí trong 1 năm đầu.</li>
            </ul>
            
    </StaticPageLayout>
  )
}
