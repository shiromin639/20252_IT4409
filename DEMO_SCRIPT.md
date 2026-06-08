# Kịch Bản Demo Dự Án Laptop Store (Microservices)

Tài liệu này cung cấp kịch bản quay video demo (3 phút và 5 phút) cũng như tài liệu tham khảo cho sinh viên khi lên bục bảo vệ đồ án/môn học. Toàn bộ nội dung dựa sát trên luồng chức năng thực tế của source code hiện tại.

## Bảng chuẩn bị dữ liệu demo

Trước khi quay, hãy đảm bảo hệ thống đã chạy (`docker-compose up -d`) và đã nạp dữ liệu mẫu (Seed data).

| Dữ liệu | Giá trị đề xuất |
| --- | --- |
| URL Trang chủ | `https://techlap.id.vn` |
| URL API Gateway | `https://api.techlap.id.vn/v1` |
| Tài khoản khách hàng | `user1` / `password123` (hoặc tài khoản tự tạo) |
| Tài khoản Admin | `admin` / `admin123` |
| Sản phẩm demo | Laptop Asus ROG Zephyrus G14, Apple MacBook Pro M3 |
| Đơn hàng demo | Đơn hàng mua 1 Laptop bất kỳ, thanh toán qua VNPay |

---

## 1. Bản Đầy Đủ (5 Phút) - Dành Cho Bảo Vệ Đồ Án / Nộp Video Khóa Luận

### Timeline Tổng Quan

| Thời gian | Hành động | Lời thuyết minh |
| --- | --- | --- |
| 00:00-00:25 | Giới thiệu | Giới thiệu dự án và bài toán Microservice |
| 00:25-01:00 | Kiến trúc | Phân tích Sơ đồ hệ thống |
| 01:00-03:00 | Chức năng User | Đăng nhập -> Tìm kiếm -> Mua hàng -> VNPay |
| 03:00-03:50 | Chức năng Admin | Quản lý Đơn hàng -> Search Analytics |
| 03:50-04:30 | Demo Kỹ thuật | Docker ps, CSDL độc lập PostgreSQL |
| 04:30-05:00 | Kết thúc | Tóm tắt & Lời cảm ơn |

### Kịch Bản Quay Và Lời Thoại Chi Tiết

#### Phần 1 - Giới thiệu dự án (25 giây)
**Shot 1:** Mở trình duyệt ở trang chủ (`https://techlap.id.vn`), zoom 110%. Cuộn trang mượt mà từ banner xuống danh sách sản phẩm.
**Lời thoại:**
> "Xin chào thầy cô và các bạn, em xin trình bày hệ thống thương mại điện tử Laptop Store. Đây là một hệ thống được thiết kế hoàn toàn theo kiến trúc Microservices. Mục tiêu của dự án là xây dựng một nền tảng bán hàng trực tuyến có khả năng chịu tải cao, quản lý độc lập các dịch vụ như quản lý kho, giỏ hàng, đơn hàng, nhằm khắc phục rủi ro sụp đổ hệ thống của các ứng dụng nguyên khối truyền thống."

#### Phần 2 - Kiến trúc hệ thống (35 giây)
**Shot 2:** Mở file ảnh Sơ đồ kiến trúc (đã có trong báo cáo) full màn hình.
**Lời thoại:**
> "Về mặt kiến trúc, hệ thống Frontend viết bằng ReactJS sẽ giao tiếp với Backend qua một API Gateway viết bằng Golang. Cổng Gateway này làm nhiệm vụ định tuyến đến 5 Microservices cốt lõi viết bằng Python FastAPI bao gồm: User, Product, Cart, Order và Inventory. Mỗi service này quản lý một CSDL PostgreSQL độc lập. Ngoài ra, hệ thống tích hợp Redis để caching và các dịch vụ bên thứ 3 như VNPay, Cloudinary và SMTP Mail."

#### Phần 3 - Demo chức năng người dùng (2 phút)
**Shot 3:** Quay lại trình duyệt, click "Đăng nhập", điền thông tin `user1` / `password123`.
**Lời thoại:**
> "Đầu tiên, người dùng thực hiện đăng nhập. Thông tin này được gửi qua API Gateway đến User Service để xác thực mật khẩu (đã hash) và trả về một JWT Token."

**Shot 4:** Gõ chữ "MacBook" vào ô tìm kiếm, hiển thị kết quả, click vào một sản phẩm cụ thể.
**Lời thoại:**
> "Tiếp theo, luồng tìm kiếm sản phẩm này sử dụng tính năng Full-text Search (TSVECTOR) trực tiếp trong PostgreSQL của Product Service để trả về kết quả cực kỳ nhanh chóng."

**Shot 5:** Click "Thêm vào giỏ hàng". Chuyển sang trang Giỏ hàng.
**Lời thoại:**
> "Khi người dùng thêm sản phẩm vào giỏ, request được chuyển cho Cart Service xử lý, lưu trữ trạng thái giỏ hàng độc lập với thông tin gốc của sản phẩm."

**Shot 6:** Click "Thanh toán", điền địa chỉ test, chọn phương thức "Thanh toán trực tuyến VNPay". Bấm "Đặt hàng".
**Lời thoại:**
> "Đến phần cốt lõi nhất: Luồng đặt hàng. Khi tạo đơn, Order Service sẽ dùng API gọi sang Inventory Service để kiểm tra số lượng và giữ chỗ (reserve) tồn kho. Nếu kho đủ hàng, hệ thống tiến hành tạo link chữ ký bảo mật và chuyển hướng người dùng sang Sandbox của VNPay."

**Shot 7:** Thao tác trên giao diện VNPay (chọn thẻ nội địa NCb, nhập OTP). Bấm xác nhận, đợi hệ thống tự động redirect về trang "Payment Success".
**Lời thoại:**
> "Sau khi thanh toán thành công, VNPay gọi ngược lại IPN Webhook của Order Service để xác nhận tiền đã vào tài khoản. Lúc này, trạng thái đơn hàng được cập nhật, lượng hàng trong kho bị trừ chính thức, và một email xác nhận sẽ được SMTP tự động gửi đi."

#### Phần 4 - Demo chức năng quản trị (50 giây)
**Shot 8:** Đăng xuất tài khoản khách. Đăng nhập tài khoản `admin` / `admin123`. Vào đường dẫn `/admin`.
**Lời thoại:**
> "Tiếp theo, với vai trò quản trị viên, Dashboard cung cấp công cụ theo dõi toàn cảnh hệ thống. Tại màn hình Đơn hàng, admin có thể duyệt và cập nhật trạng thái giao hàng. Đặc biệt, hệ thống cung cấp tính năng Search Analytics để thống kê xu hướng tìm kiếm của khách hàng, và khả năng upload ảnh sản phẩm đẩy thẳng lên CDN của Cloudinary giúp tối ưu tốc độ."

#### Phần 5 - Demo kỹ thuật (40 giây)
**Shot 9:** Mở Terminal gõ lệnh `docker ps` phóng to text. Mở phần mềm quản lý CSDL (PgAdmin/DBeaver) hoặc gõ lệnh kết nối DB.
**Lời thoại:**
> "Về mặt kỹ thuật dưới nền tảng, hệ thống đang chạy hoàn toàn phân tán trên Docker. Dựa vào `docker ps`, thầy cô có thể thấy các container của 5 Microservice, API Gateway, Redis và PostgreSQL hoạt động độc lập. Trong PostgreSQL, chúng ta tạo ra 5 cơ sở dữ liệu vật lý riêng rẽ, đảm bảo không có việc JOIN bảng chéo giữa các service, tuân thủ nghiêm ngặt nguyên lý Microservices."

#### Phần 6 - Kết thúc (25 giây)
**Shot 10:** Trở về trình duyệt ở giao diện trang chủ, để yên màn hình.
**Lời thoại:**
> "Dự án không chỉ là một website bán hàng, mà trọng tâm là thiết kế được kiến trúc chịu tải, giao tiếp liên dịch vụ (Inter-service communication) an toàn. Ứng dụng Go và FastAPI đã đem lại hiệu năng đáng kể. Bài demo của em xin khép lại tại đây, xin cảm ơn hội đồng đã lắng nghe và rất mong nhận được sự góp ý."

---

## 2. Bản Rút Gọn (3 Phút) - Dành Cho Nộp Qua Form / Video Ngắn

Phù hợp khi môn học yêu cầu video nộp trước ngắn gọn giới thiệu năng lực cốt lõi.

| Thời gian | Kịch bản rút gọn & Lời thoại |
| --- | --- |
| 00:00-00:30 | **(Quay Trang chủ & Sơ đồ)** "Xin chào, em xin demo dự án Laptop Store. Hệ thống áp dụng kiến trúc Microservices gồm API Gateway bằng Go, 5 service bằng FastAPI (User, Product, Cart, Order, Inventory) kết hợp CSDL PostgreSQL, Redis, và được Dockerized toàn bộ." |
| 00:30-01:45 | **(Quay Luồng mua hàng từ Tìm kiếm -> Thanh toán VNPay)** "Về tính năng cốt lõi: Khi người dùng thêm hàng vào giỏ và ấn Thanh toán VNPay, request đi qua API Gateway vào Order Service. Order Service tiến hành gọi Inventory Service để khóa tồn kho (reserve), sau đó gen link thanh toán. Thanh toán xong, VNPay gọi webhook để cập nhật trạng thái đơn và báo Email Service gửi thư cho khách." |
| 01:45-02:15 | **(Quay trang Admin)** "Bên cạnh Front-end cho khách, hệ thống có Admin Dashboard để quản trị Sản phẩm (upload ảnh qua Cloudinary), duyệt đơn hàng và xem thống kê Search Analytics." |
| 02:15-02:45 | **(Quay Terminal `docker ps` & DB)** "Để chứng minh tính phân tán, hệ thống hiện đang chạy nhiều container. CSDL được phân mảnh thành 5 database khác nhau ứng với từng domain logic." |
| 02:45-03:00 | **(Kết thúc)** "Hệ thống đã đạt được các yêu cầu về nghiệp vụ lẫn kiến trúc, có khả năng mở rộng tốt trong môi trường thực tế. Em xin cảm ơn thầy cô đã theo dõi." |

---

## 3. Cẩm nang khi thuyết trình / Bảo vệ đồ án

Khi đứng trên bục bảo vệ, cần thuộc những mẫu câu này để dẫn dắt mạch lạc và tự tin xử lý sự cố.

### 10 câu chuyển ý tự nhiên
1. "Để thầy cô hình dung rõ hơn về luồng kiến trúc vừa trình bày, em xin phép demo trực tiếp trên hệ thống."
2. "Tiếp nối phần kiến trúc mạng, chúng ta hãy xem tính năng Đặt hàng thực tế sẽ diễn ra như thế nào."
3. "Một tính năng thú vị mà chúng em đã giải quyết ở mức Backend là..."
4. "Đó là luồng giao diện của người mua, vậy còn luồng của quản trị viên thì sao? Xin mời thầy cô nhìn lên màn hình."
5. "Chắc hẳn thầy cô sẽ thắc mắc Microservice xử lý việc trừ kho đồng bộ ra sao, em xin giải thích cơ chế này..."
6. "Và đây là phần phức tạp nhất của dự án, luồng tích hợp thanh toán qua API của VNPay."
7. "Sau khi thanh toán thành công trên VNPay, điều gì sẽ xảy ra ngầm ở Server Backend?"
8. "Để chứng minh hệ thống thực sự chạy Microservices chứ không phải là giả lập, em xin mở công cụ Docker lên."
9. "Như thầy cô đang thấy trên Terminal logs của API Gateway, request đang được định tuyến liên tục..."
10. "Bây giờ, em xin phép chuyển sang phần tổng kết, đánh giá ưu nhược điểm và hướng phát triển."

### 10 câu trả lời khi demo gặp lỗi (Kỹ năng sinh tồn)
1. "Dạ có vẻ kết nối internet hơi chậm khiến request tới Sandbox VNPay bị timeout, thầy cô đợi em vài giây để gửi lại request ạ."
2. "Do đang chạy đồng thời rất nhiều container trên máy cục bộ nên bộ nhớ có chút quá tải, em xin phép tải lại trang."
3. "Dạ phần này do JWT Token sinh ra trước đó đã hết hạn, em xin phép đăng nhập lại để lấy Token mới."
4. "Có một chút trục trặc nhỏ với CSDL PostgreSQL trên máy local, nhưng luồng logic chính là như em vừa giải thích ở sơ đồ."
5. "Tính năng này em test trên môi trường Linux thì hoạt động rất tốt, có thể cấu hình biến môi trường `.env` trên máy Windows chiếu này đang bị thiếu."
6. "Lỗi 502 Bad Gateway này xảy ra do API Gateway chưa kịp kết nối tới Service phía sau (Container đang khởi động), em xin phép F5 lại."
7. "Dạ hình ảnh chỗ này bị lỗi (broken) là do Cloudinary đã xóa ảnh cache tự động hoặc tài khoản test của nhóm em hết băng thông."
8. "Phần giao diện bị vỡ một chút là do tỷ lệ khung hình của máy chiếu khác với màn hình lúc tụi em code, em xin phép thu nhỏ trình duyệt xuống 80%."
9. "Dạ đây là một trường hợp ngoại lệ (Edge case) mà nhóm chưa cover hết validation ở Frontend, cảm ơn thầy cô đã chỉ ra, em sẽ note lại để fix ngay sau buổi hôm nay ạ."
10. "Lỗi này do server mail SMTP từ chối vì gửi quá nhiều email rác trong lúc test, tuy nhiên trạng thái đơn hàng ở Database vẫn được ghi nhận đúng."

### 10 câu kết thúc chuyên nghiệp
1. "Trên đây là toàn bộ tính năng và giải pháp kỹ thuật của hệ thống. Nhóm em xin chân thành cảm ơn hội đồng đã lắng nghe."
2. "Mặc dù còn nhiều điểm có thể tối ưu thêm về Message Queue, nhưng hệ thống đã giải quyết được trọn vẹn nghiệp vụ cốt lõi."
3. "Bài demo của nhóm xin khép lại tại đây. Tiếp theo, em xin phép sẵn sàng lắng nghe các câu hỏi và nhận xét từ hội đồng."
4. "Sự hướng dẫn sát sao của thầy cô trong học kỳ qua là nền tảng để bọn em hoàn thiện sản phẩm. Chúng em xin cảm ơn rất nhiều."
5. "Hy vọng hệ thống của bọn em đã mang lại một góc nhìn rõ ràng về cách áp dụng kiến trúc Microservices vào thực tế."
6. "Sản phẩm thực tế vẫn còn nhiều không gian để phát triển thêm, nhóm cam kết sẽ tiếp tục hoàn thiện nếu có cơ hội. Em xin trân trọng cảm ơn."
7. "Đó là những nỗ lực và tâm huyết của nhóm trong suốt thời gian qua. Kính mời hội đồng đặt câu hỏi chất vấn."
8. "Cảm ơn thầy cô đã dành thời gian theo dõi. Bọn em rất mong nhận được những ý kiến đóng góp khắt khe để nhận ra thiếu sót."
9. "Sự thành công của một đồ án không chỉ nằm ở những dòng code chạy được, mà còn ở những bài học thiết kế hệ thống rút ra. Xin cảm ơn hội đồng."
10. "Phần trình bày của nhóm em đã kết thúc, em xin nhường lời lại cho chủ tịch hội đồng."
