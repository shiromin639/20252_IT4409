import StaticPageLayout from '../../components/layout/StaticPage/StaticPageLayout'

export default function CareersPage() {
  const breadcrumbs = [{"label": "Thông tin công ty"}, {"label": "Tuyển dụng"}]

  return (
    <StaticPageLayout title="Tuyển dụng" breadcrumbs={breadcrumbs}>
      
            <h2>1. Vị trí Nhân viên Bán hàng</h2>
            <p><strong>Số lượng:</strong> 10 người</p>
            <p><strong>Yêu cầu:</strong> Đam mê công nghệ, kỹ năng giao tiếp tốt. Ưu tiên có kinh nghiệm bán lẻ.</p>
            <p><strong>Quyền lợi:</strong> Lương cứng 7-10 triệu + Hoa hồng không giới hạn. BHXH đầy đủ.</p>
            <h2>2. Vị trí Kỹ thuật viên phần cứng</h2>
            <p><strong>Số lượng:</strong> 5 người</p>
            <p><strong>Yêu cầu:</strong> Thành thạo tháo lắp laptop, cài đặt phần mềm. Kinh nghiệm 1 năm trở lên.</p>
            <p>Nộp CV về địa chỉ: hr@techlap.vn</p>
            
    </StaticPageLayout>
  )
}
