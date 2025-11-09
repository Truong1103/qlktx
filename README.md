# Hệ thống Quản lý Ký túc xá

Website quản lý ký túc xá với đầy đủ chức năng cho sinh viên và quản trị viên.

## Tính năng

### Cho Sinh viên:
1. **Đăng ký KTX** - Đăng ký chỗ ở tại ký túc xá
2. **Xác nhận vào ở** - Xác nhận và hoàn tất thủ tục vào ở
3. **Xin miễn/giảm phí** - Gửi yêu cầu miễn/giảm phí
4. **Thanh toán phí** - Thanh toán các khoản phí KTX với xuất hóa đơn PDF/ảnh

### Cho Quản trị viên:
1. **Cấu hình hệ thống** - Quản lý cấu hình và phòng chi tiết
2. **Xử lý đơn đăng ký** - Duyệt và xử lý đơn đăng ký với thống kê
3. **Xử lý vào ở** - Quản lý thủ tục vào ở với lịch hẹn
4. **Xử lý yêu cầu phí** - Duyệt yêu cầu miễn/giảm phí

## Công nghệ sử dụng

- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (Vanilla JS)
- LocalStorage (lưu trữ dữ liệu tạm thời)
- jsPDF & html2canvas (xuất hóa đơn)

## Cách sử dụng

### Đăng nhập

**Sinh viên:**
- MSSV: `2374802010283` hoặc `2374802010445`
- Password: `123`

**Quản trị viên:**
- Username: `admin`
- Password: `123`

### Cấu trúc file

```
web/
├── index.html                      # Trang đăng nhập
├── app.js                          # Logic chung và authentication
├── styles.css                      # CSS tùy chỉnh
├── Logo_van_lang.webp.png          # Logo
│
├── student-dashboard.html          # Dashboard sinh viên
├── student-dashboard.js
├── student-register.html           # Đăng ký KTX
├── student-register.js
├── student-confirm.html            # Xác nhận vào ở
├── student-confirm.js
├── student-fee-request.html       # Xin miễn/giảm phí
├── student-fee-request.js
├── student-payment.html            # Thanh toán phí
├── student-payment.js
│
├── admin-dashboard.html            # Dashboard admin
├── admin-dashboard.js
├── admin-config.html               # Cấu hình hệ thống
├── admin-config.js
├── admin-process-registration.html # Xử lý đơn đăng ký
├── admin-process-registration.js
├── admin-checkin.html             # Xử lý vào ở
├── admin-checkin.js
├── admin-fee-request.html         # Xử lý yêu cầu phí
└── admin-fee-request.js
```

## Deploy lên GitHub Pages

1. Tạo repository trên GitHub
2. Push code lên GitHub
3. Vào Settings > Pages
4. Chọn branch `main` và folder `/root`
5. Truy cập link: `https://username.github.io/repository-name`

## Lưu ý

- Dữ liệu được lưu trong LocalStorage của trình duyệt
- Để reset dữ liệu, xóa LocalStorage trong Developer Tools
- Website này là demo, cần kết nối backend thật để sử dụng trong môi trường production
