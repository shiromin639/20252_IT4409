import os

base_path = r"c:\Users\tyrt\Documents\20252_IT4409\frontend\src\pages"

pages = {
    "Information": {
        "AboutPage": {
            "title": "Giới thiệu công ty",
            "bc": [{"label": "Thông tin công ty"}, {"label": "Giới thiệu"}],
            "content": """
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
            """
        },
        "WarrantyPage": {
            "title": "Chính sách bảo hành",
            "bc": [{"label": "Hỗ trợ"}, {"label": "Bảo hành"}],
            "content": """
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
            """
        },
        "PromotionsPage": {
            "title": "Khuyến mãi",
            "bc": [{"label": "Thông tin"}, {"label": "Khuyến mãi"}],
            "content": """
            <h2>1. Chương trình Back To School</h2>
            <p>Giảm ngay đến 3.000.000 VNĐ cho Học sinh - Sinh viên khi mua Laptop. Tặng kèm Balo, chuột không dây và voucher giảm giá 20% khi mua phụ kiện.</p>
            <h2>2. Giờ vàng giá sốc</h2>
            <p>Mỗi cuối tuần, TechLap tổ chức chương trình Flash Sale giảm đến 50% cho các sản phẩm linh kiện và phụ kiện công nghệ.</p>
            <h2>3. Trả góp 0% lãi suất</h2>
            <p>Hỗ trợ trả góp 0% qua thẻ tín dụng của 25 ngân hàng đối tác hoặc qua các công ty tài chính (Home Credit, HD Saison) với thủ tục đơn giản.</p>
            """
        },
        "InstallmentPage": {
            "title": "Hướng dẫn trả góp",
            "bc": [{"label": "Hỗ trợ"}, {"label": "Trả góp"}],
            "content": """
            <h2>1. Trả góp qua thẻ tín dụng (0% lãi suất)</h2>
            <p>Chấp nhận thẻ tín dụng của hơn 25 ngân hàng: Vietcombank, Techcombank, VPBank, Sacombank,... Khách hàng chỉ cần có thẻ tín dụng và hạn mức đủ thanh toán giá trị đơn hàng.</p>
            <h2>2. Trả góp qua công ty tài chính</h2>
            <p>Đối tác: Home Credit, HD Saison, FE Credit.</p>
            <ul>
                <li>Độ tuổi: Từ 18 - 60 tuổi</li>
                <li>Thủ tục: CCCD gắn chip (không cần sổ hộ khẩu)</li>
                <li>Duyệt hồ sơ nhanh chóng trong 15 phút</li>
            </ul>
            """
        },
        "SupportPage": {
            "title": "Hỗ trợ kỹ thuật",
            "bc": [{"label": "Hỗ trợ"}, {"label": "Kỹ thuật"}],
            "content": """
            <h2>1. Tổng đài hỗ trợ</h2>
            <p>Hotline kỹ thuật: <strong>1800 6970</strong> (Hoạt động từ 8:00 - 21:00 hàng ngày).</p>
            <h2>2. Dịch vụ hỗ trợ từ xa</h2>
            <p>TechLap cung cấp dịch vụ hỗ trợ cài đặt phần mềm, kiểm tra lỗi qua UltraViewer/TeamViewer hoàn toàn miễn phí cho khách hàng mua máy tại hệ thống.</p>
            <h2>3. Câu hỏi thường gặp (FAQ)</h2>
            <ul>
                <li><strong>Máy không lên nguồn:</strong> Kiểm tra lại sạc và ổ cắm. Nhấn giữ nút nguồn 30s để hard reset.</li>
                <li><strong>Lỗi Windows:</strong> Có thể mang máy đến cửa hàng để được hỗ trợ cài lại Win miễn phí trong 1 năm đầu.</li>
            </ul>
            """
        },
        "NewsPage": {
            "title": "Tin tức công nghệ",
            "bc": [{"label": "Tin tức"}, {"label": "Công nghệ"}],
            "content": """
            <h2>Đánh giá MacBook Pro M3 mới ra mắt</h2>
            <p>Apple vừa trình làng dòng MacBook Pro M3 với hiệu năng vượt trội, thời lượng pin lên đến 22 giờ. Điểm nhấn lớn nhất là chip M3 Max hỗ trợ tối đa 128GB RAM.</p>
            <h2>Top 5 Laptop Gaming đáng mua nhất 2024</h2>
            <p>Thị trường laptop gaming đang sôi động hơn bao giờ hết với sự xuất hiện của dòng card RTX 40-series. Dưới đây là 5 mẫu laptop cân tốt mọi tựa game AAA hiện nay...</p>
            """
        },
        "StoresPage": {
            "title": "Hệ thống cửa hàng",
            "bc": [{"label": "Thông tin"}, {"label": "Cửa hàng"}],
            "content": """
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
            """
        },
        "CareersPage": {
            "title": "Tuyển dụng",
            "bc": [{"label": "Thông tin công ty"}, {"label": "Tuyển dụng"}],
            "content": """
            <h2>1. Vị trí Nhân viên Bán hàng</h2>
            <p><strong>Số lượng:</strong> 10 người</p>
            <p><strong>Yêu cầu:</strong> Đam mê công nghệ, kỹ năng giao tiếp tốt. Ưu tiên có kinh nghiệm bán lẻ.</p>
            <p><strong>Quyền lợi:</strong> Lương cứng 7-10 triệu + Hoa hồng không giới hạn. BHXH đầy đủ.</p>
            <h2>2. Vị trí Kỹ thuật viên phần cứng</h2>
            <p><strong>Số lượng:</strong> 5 người</p>
            <p><strong>Yêu cầu:</strong> Thành thạo tháo lắp laptop, cài đặt phần mềm. Kinh nghiệm 1 năm trở lên.</p>
            <p>Nộp CV về địa chỉ: hr@techlap.vn</p>
            """
        },
        "PartnershipPage": {
            "title": "Liên hệ hợp tác",
            "bc": [{"label": "Thông tin công ty"}, {"label": "Hợp tác"}],
            "content": """
            <h2>1. Hợp tác Doanh nghiệp (B2B)</h2>
            <p>TechLap cung cấp giải pháp thiết bị CNTT toàn diện cho doanh nghiệp với mức chiết khấu cực kỳ ưu đãi, hỗ trợ công nợ linh hoạt và dịch vụ bảo hành tận nơi.</p>
            <h2>2. Hợp tác Truyền thông & Đại lý</h2>
            <p>Chúng tôi luôn chào đón các đối tác truyền thông, KOL/Reviewer công nghệ để cùng hợp tác phát triển thương hiệu.</p>
            <p>Vui lòng liên hệ: b2b@techlap.vn hoặc Hotline: 0999 888 777</p>
            """
        }
    },
    "Policies": {
        "ReturnPolicyPage": {
            "title": "Chính sách đổi trả",
            "bc": [{"label": "Chính sách"}, {"label": "Đổi trả"}],
            "content": """
            <h2>1. Đổi trả lỗi nhà sản xuất (Trong 15 ngày đầu)</h2>
            <p>Nếu sản phẩm phát sinh lỗi phần cứng từ nhà sản xuất (được trung tâm bảo hành hãng xác nhận), khách hàng sẽ được đổi NGAY MỘT SẢN PHẨM MỚI 100% cùng model.</p>
            <h2>2. Đổi trả do nhu cầu (Không lỗi)</h2>
            <p>Chúng tôi hỗ trợ thu lại máy với mức phí 15% - 20% giá trị hóa đơn trong tháng đầu tiên nếu khách hàng muốn đổi sang sản phẩm khác hoặc hoàn tiền.</p>
            <h2>3. Điều kiện đổi trả</h2>
            <ul>
                <li>Máy không bị trầy xước, cấn móp, ngấm nước.</li>
                <li>Phải giữ đầy đủ hộp, phụ kiện và quà tặng kèm theo.</li>
            </ul>
            """
        },
        "ShippingPolicyPage": {
            "title": "Chính sách giao hàng",
            "bc": [{"label": "Chính sách"}, {"label": "Giao hàng"}],
            "content": """
            <h2>1. Giao hàng Hỏa tốc 2H</h2>
            <p>Áp dụng cho các đơn hàng nội thành Hà Nội và TP.HCM. Khách hàng sẽ nhận được sản phẩm trong vòng 2 tiếng kể từ khi chốt đơn.</p>
            <h2>2. Giao hàng toàn quốc (Ship COD)</h2>
            <p>TechLap hợp tác với GHTK, Viettel Post để giao hàng đến 63 tỉnh thành.</p>
            <ul>
                <li>Thời gian giao hàng: 2 - 5 ngày tùy khu vực.</li>
                <li>Khách hàng được kiểm tra hàng trước khi thanh toán (Đồng kiểm).</li>
            </ul>
            <h2>3. Phí vận chuyển</h2>
            <p>Miễn phí vận chuyển cho tất cả đơn hàng Laptop trên toàn quốc.</p>
            """
        },
        "PrivacyPolicyPage": {
            "title": "Bảo mật thông tin",
            "bc": [{"label": "Chính sách"}, {"label": "Bảo mật"}],
            "content": """
            <h2>1. Mục đích thu thập thông tin</h2>
            <p>Chúng tôi thu thập thông tin (tên, số điện thoại, địa chỉ, email) nhằm mục đích xử lý đơn hàng, hỗ trợ bảo hành và gửi thông tin khuyến mãi (nếu khách hàng đồng ý).</p>
            <h2>2. Cam kết bảo mật</h2>
            <p>TechLap cam kết tuyệt đối KHÔNG chia sẻ, bán hoặc rò rỉ thông tin cá nhân của khách hàng cho bất kỳ bên thứ ba nào vì mục đích thương mại.</p>
            <h2>3. Thanh toán an toàn</h2>
            <p>Mọi giao dịch thanh toán qua thẻ tín dụng/ATM đều được mã hóa bằng giao thức SSL và được xử lý bởi các cổng thanh toán uy tín (VNPay, MoMo) đạt chuẩn bảo mật quốc tế.</p>
            """
        },
        "PaymentGuidePage": {
            "title": "Hướng dẫn thanh toán",
            "bc": [{"label": "Chính sách"}, {"label": "Thanh toán"}],
            "content": """
            <h2>1. Thanh toán tiền mặt (COD)</h2>
            <p>Khách hàng có thể thanh toán tiền mặt trực tiếp tại cửa hàng hoặc thanh toán cho nhân viên giao hàng khi nhận máy tại nhà.</p>
            <h2>2. Chuyển khoản ngân hàng</h2>
            <p>Hỗ trợ chuyển khoản nhanh 24/7 qua mã QR Code. Giao dịch được xác nhận tự động trong vòng 1-3 phút.</p>
            <h2>3. Thanh toán qua thẻ tín dụng/ATM</h2>
            <p>Chấp nhận thẻ Visa, Mastercard, JCB, thẻ ATM nội địa thông qua cổng thanh toán VNPay và ví điện tử MoMo.</p>
            """
        }
    }
}

template = """import StaticPageLayout from '../../components/layout/StaticPage/StaticPageLayout'

export default function {component_name}() {{
  const breadcrumbs = {bc_json}

  return (
    <StaticPageLayout title="{title}" breadcrumbs={{breadcrumbs}}>
      {content}
    </StaticPageLayout>
  )
}}
"""

import json

for folder, files in pages.items():
    for comp_name, details in files.items():
        file_path = os.path.join(base_path, folder, f"{comp_name}.jsx")
        bc_json = json.dumps(details["bc"], ensure_ascii=False)
        
        content = template.format(
            component_name=comp_name,
            bc_json=bc_json,
            title=details["title"],
            content=details["content"]
        )
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

print("Scaffolded 13 pages successfully.")
