import StaticPageLayout from '../../components/layout/StaticPage/StaticPageLayout'

export default function ReturnPolicyPage() {
  const breadcrumbs = [{"label": "Chính sách"}, {"label": "Đổi trả"}]

  return (
    <StaticPageLayout title="Chính sách đổi trả" breadcrumbs={breadcrumbs}>
      
            <h2>1. Đổi trả lỗi nhà sản xuất (Trong 15 ngày đầu)</h2>
            <p>Nếu sản phẩm phát sinh lỗi phần cứng từ nhà sản xuất (được trung tâm bảo hành hãng xác nhận), khách hàng sẽ được đổi NGAY MỘT SẢN PHẨM MỚI 100% cùng model.</p>
            <h2>2. Đổi trả do nhu cầu (Không lỗi)</h2>
            <p>Chúng tôi hỗ trợ thu lại máy với mức phí 15% - 20% giá trị hóa đơn trong tháng đầu tiên nếu khách hàng muốn đổi sang sản phẩm khác hoặc hoàn tiền.</p>
            <h2>3. Điều kiện đổi trả</h2>
            <ul>
                <li>Máy không bị trầy xước, cấn móp, ngấm nước.</li>
                <li>Phải giữ đầy đủ hộp, phụ kiện và quà tặng kèm theo.</li>
            </ul>
            
    </StaticPageLayout>
  )
}
