import StaticPageLayout from '../../components/layout/StaticPage/StaticPageLayout'

export default function WarrantyPage() {
  const breadcrumbs = [{"label": "Hỗ trợ"}, {"label": "Bảo hành"}]

  return (
    <StaticPageLayout title="Chính sách bảo hành" breadcrumbs={breadcrumbs}>
      
            <h2>1. Thời hạn bảo hành</h2>
            <p>Tất cả các sản phẩm laptop mua tại TechLap đều được hưởng chính sách bảo hành chính hãng từ 12 đến 24 tháng tùy theo quy định của nhà sản xuất (Apple, Dell, ASUS, HP, Lenovo,...).</p>
            <h2>2. Điều kiện bảo hành</h2>
            <ul>
                <li>Sản phẩm còn trong thời hạn bảo hành.</li>
                <li>Tem bảo hành còn nguyên vẹn, không có dấu hiệu cạo sửa.</li>
                <li>Sản phẩm không bị rơi vỡ, vào nước, hoặc can thiệp phần cứng bởi bên thứ ba.</li>
            </ul>
            <h2>3. Quy trình bảo hành</h2>
            <p>Khách hàng mang sản phẩm đến các trung tâm bảo hành của TechLap hoặc trung tâm bảo hành ủy quyền của hãng. Thời gian xử lý từ 3-7 ngày làm việc.</p>
            
    </StaticPageLayout>
  )
}
