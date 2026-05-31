import StaticPageLayout from '../../components/layout/StaticPage/StaticPageLayout'

export default function PromotionsPage() {
  const breadcrumbs = [{"label": "Thông tin"}, {"label": "Khuyến mãi"}]

  return (
    <StaticPageLayout title="Khuyến mãi" breadcrumbs={breadcrumbs}>
      
            <h2>1. Chương trình Back To School</h2>
            <p>Giảm ngay đến 3.000.000 VNĐ cho Học sinh - Sinh viên khi mua Laptop. Tặng kèm Balo, chuột không dây và voucher giảm giá 20% khi mua phụ kiện.</p>
            <h2>2. Giờ vàng giá sốc</h2>
            <p>Mỗi cuối tuần, TechLap tổ chức chương trình Flash Sale giảm đến 50% cho các sản phẩm linh kiện và phụ kiện công nghệ.</p>
            <h2>3. Trả góp 0% lãi suất</h2>
            <p>Hỗ trợ trả góp 0% qua thẻ tín dụng của 25 ngân hàng đối tác hoặc qua các công ty tài chính (Home Credit, HD Saison) với thủ tục đơn giản.</p>
            
    </StaticPageLayout>
  )
}
