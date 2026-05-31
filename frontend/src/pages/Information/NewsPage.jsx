import StaticPageLayout from '../../components/layout/StaticPage/StaticPageLayout'

export default function NewsPage() {
  const breadcrumbs = [{"label": "Tin tức"}, {"label": "Công nghệ"}]

  return (
    <StaticPageLayout title="Tin tức công nghệ" breadcrumbs={breadcrumbs}>
      
            <h2>Đánh giá MacBook Pro M3 mới ra mắt</h2>
            <p>Apple vừa trình làng dòng MacBook Pro M3 với hiệu năng vượt trội, thời lượng pin lên đến 22 giờ. Điểm nhấn lớn nhất là chip M3 Max hỗ trợ tối đa 128GB RAM.</p>
            <h2>Top 5 Laptop Gaming đáng mua nhất 2024</h2>
            <p>Thị trường laptop gaming đang sôi động hơn bao giờ hết với sự xuất hiện của dòng card RTX 40-series. Dưới đây là 5 mẫu laptop cân tốt mọi tựa game AAA hiện nay...</p>
            
    </StaticPageLayout>
  )
}
