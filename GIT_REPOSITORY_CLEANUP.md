# Báo Cáo Dọn Dẹp Repository (Git Repository Cleanup)

Để public mã nguồn lên GitHub một cách chuyên nghiệp và an toàn, dự án cần được tổ chức lại và loại bỏ các dữ liệu nhạy cảm. Dưới đây là phân tích chi tiết:

## 1. File NÊN Commit
Đây là những file bắt buộc phải có để một người mới clone repository về có thể chạy được dự án:
- **Source code chính**: Toàn bộ thư mục `frontend/src/`, `frontend/public/`, `backend/*/app/`, `backend/api-gateway/main.go`.
- **Cấu hình dự án**: `docker-compose.yml`, `frontend/package.json`, `frontend/vite.config.js`, `backend/*/pyproject.toml`, `backend/api-gateway/go.mod`.
- **Lock files**: `frontend/package-lock.json`, `backend/*/uv.lock` (để đảm bảo tính nhất quán của thư viện).
- **Scripts khởi tạo**: `scripts/init-multiple-databases.sql`, `scripts/start-fastapi.sh`.
- **Environment Template**: `.env.example`.

## 2. File KHÔNG NÊN Commit (Đã được đưa vào `.gitignore`)
- Các file chứa biến môi trường: `.env`, `frontend/.env`, `backend/*/.env`.
- Thư mục build và cache của Frontend: `frontend/node_modules/`, `frontend/dist/`.
- Cache của Backend Python: `__pycache__/`, `.venv/`, `.pytest_cache/`.
- File hệ thống & IDE: `.vscode/`, `.idea/`, `.DS_Store`, `Thumbs.db`.

## 3. Các File Nên Di Chuyển Sang Thư Mục `docs/`
Dự án đang để rất nhiều file tài liệu ở thư mục gốc (root), làm repository trông khá lộn xộn. Nên gom vào một thư mục `docs/`:
- `PROJECT_REPORT.md`
- `TECHNOLOGY_ANALYSIS.md`
- `DEMO_SCRIPT.md`
- `INTEGRATION_ANALYSIS.md`
- `DOCKER_SETUP_GUIDE.md`
- `LOCAL_DEVELOPMENT_GUIDE.md`
- `CLOUDFLARE_DEPLOYMENT_GUIDE.md`
- `API_CONTRACT.md`
- `DEMO_ACCOUNTS.md`

## 4. Các File Nên Di Chuyển Sang Thư Mục `scripts/` hoặc `tests/`
Có rất nhiều file code tạm thời dùng để test/seed dữ liệu nằm rải rác:
- Tại thư mục gốc: `test.py`, `test_email.py`, `test_smtp.py`, `test_smtp_host.py`, `send_test_email.py`.
- Tại thư mục `backend/`: `fetch_monthly_revenue.py`, `seed_analytics.py`, `test_vnpay.py`.
- Các file HTML render email tĩnh: `preview_delivered.html`, `preview_order_confirmation.html`, `preview_payment_success.html`, `preview_shipped.html`.

**Khuyến nghị**: Nên dọn dẹp các file `test_*.py` vào một thư mục `tests/` hoặc `scripts/playground/`. File HTML có thể cho vào `docs/email-templates/`.

## 5. ⚠️ Các Rủi Ro Bảo Mật Nếu Push Mã Nguồn Ngay Bây Giờ
Nếu bạn thực hiện `git add .` và push lên GitHub ngay lúc này, hệ thống của bạn sẽ bị lộ các rủi ro bảo mật vô cùng nguy hiểm do file `.env` đang chứa:

1. **Database Password**: Các biến `POSTGRES_PASSWORD` sẽ bị lộ, dẫn đến nguy cơ bị tấn công Drop/Ransomware Database.
2. **JWT Secret**: Biến `SECRET_KEY` bị lộ khiến bất kỳ ai cũng có thể giả mạo (forge) token của Admin và chiếm quyền điều khiển hệ thống.
3. **Cloudinary Credentials**: `CLOUDINARY_API_KEY` và `CLOUDINARY_API_SECRET` lộ ra sẽ khiến người khác có thể sử dụng quota lưu trữ ảnh của bạn.
4. **SMTP Credentials**: Lộ `SMTP_USERNAME` và `SMTP_PASSWORD` dẫn đến việc email của bạn có thể bị dùng để gửi spam/phishing.
5. **VNPay Credentials**: Lộ `VNPAY_HASH_SECRET` khiến kẻ gian có thể giả mạo webhook thanh toán để làm giả giao dịch thành công (dù chưa hề chuyển tiền).

**Hành động tức thì**:
- Chắc chắn đã thêm `.env` vào `.gitignore`.
- KHÔNG BAO GIỜ gõ `git add .env` hoặc `git add -f .env`.
- Chạy lệnh `git rm -r --cached .` rồi `git add .` nếu lỡ commit file nhạy cảm vào local Git từ trước.
