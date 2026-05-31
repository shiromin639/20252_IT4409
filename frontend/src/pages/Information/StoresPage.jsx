import StaticPageLayout from '../../components/layout/StaticPage/StaticPageLayout'

export default function StoresPage() {
  const breadcrumbs = [{"label": "Thông tin"}, {"label": "Cửa hàng"}]

  return (
    <StaticPageLayout title="Hệ thống cửa hàng" breadcrumbs={breadcrumbs}>
      
            <h2>Khu vực Hà Nội</h2>
            <ul>
                <li><strong>Showroom 1:</strong> Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội. (Mở cửa: 8h-22h)</li>
                <li><strong>Showroom 2:</strong> 15 Thái Hà, Đống Đa, Hà Nội. (Mở cửa: 8h-22h)</li>
            </ul>
            <h2>Khu vực TP. Hồ Chí Minh</h2>
            <ul>
                <li><strong>Showroom 3:</strong> 123 Nguyễn Thị Minh Khai, Quận 1, TP.HCM. (Mở cửa: 8h-22h)</li>
                <li><strong>Showroom 4:</strong> 456 Lê Hồng Phong, Quận 10, TP.HCM. (Mở cửa: 8h-22h)</li>
            </ul>
            
    </StaticPageLayout>
  )
}
