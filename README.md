Markdown

# Chức năng Reminder - Pet Care+

## Giới thiệu 🐾

Hệ thống Reminder của Pet Care+ giúp người dùng quản lý các lịch trình chăm sóc thú cưng quan trọng như tiêm phòng (Vaccination), kiểm tra sức khỏe (Check-up), cho ăn (Feeding), và chăm sóc lông (Grooming). Hệ thống bao gồm các API để quản lý thủ công và các công việc tự động (cron job) để xử lý các nhắc nhở lặp lại, gửi thông báo qua email, và dọn dẹp các nhắc nhở đã quá hạn.

## Cài đặt và Cấu hình ⚙️

### 1. Cài đặt Dependencies

Đảm bảo bạn đang ở trong thư mục `backend` của dự án. Chạy lệnh sau để cài đặt thư viện cần thiết cho việc gửi email:

```bash
npm install nodemailer

2. Cấu hình Biến Môi trường (.env)
Mở file .env trong thư mục backend và đảm bảo các biến sau được cấu hình chính xác:

Đoạn mã

# Database Configuration (Đã có sẵn)
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=pet_care_db

# Email Configuration (Thêm hoặc cập nhật)
EMAIL_HOST=smtp.gmail.com  # Ví dụ: Gmail SMTP server
EMAIL_PORT=587             # Port cho TLS (Phổ biến cho Gmail)
EMAIL_SECURE=false         # false cho port 587 (TLS), true nếu dùng port 465 (SSL)
EMAIL_USER=your_email@gmail.com # Email dùng để gửi thông báo
EMAIL_PASS=your_app_password   # !!! Mật khẩu ứng dụng (Xem lưu ý bên dưới) !!!
EMAIL_FROM='"PetCare+ Alerts" <your_email@gmail.com>' # Tên và địa chỉ người gửi hiển thị
⚠️ Lưu ý quan trọng về EMAIL_PASS:

Gmail: Bạn KHÔNG thể sử dụng mật khẩu đăng nhập Gmail thông thường. Bạn cần:

Bật Xác minh 2 bước cho tài khoản Google (EMAIL_USER).

Tạo một Mật khẩu ứng dụng (App Password) riêng cho ứng dụng Pet Care+ này trong cài đặt bảo mật tài khoản Google.

Sử dụng Mật khẩu ứng dụng đó làm giá trị cho EMAIL_PASS.

Dịch vụ Email khác: Sử dụng thông tin SMTP hoặc API key do nhà cung cấp dịch vụ email của bạn cung cấp.

3. Database Schema
Đảm bảo database của bạn có các bảng sau với cấu trúc cần thiết (tham khảo schema.sql):

Users: Chứa thông tin người dùng, quan trọng nhất là cột email để hệ thống biết gửi thông báo đến đâu.

Pets: Chứa thông tin thú cưng, liên kết với user_id.

reminders: Bảng chính chứa thông tin nhắc nhở, bao gồm reminder_id, pet_id, type, reminder_date, feeding_time, frequency, status, is_read, created_at, end_date, vaccination_type.

Các Thành phần Chính 🧩
backend/routes/reminders.js:

Định nghĩa các API endpoints (GET, POST, PUT, DELETE) để frontend tương tác, quản lý reminders.

Chứa logic validation dữ liệu đầu vào.

Chứa hàm calculateDisplayFields để tính toán các trường hiển thị phụ trợ (display_title, subtitle, is_new_today) dựa trên dữ liệu thô từ database.

backend/utils/mailer.js:

Sử dụng nodemailer và cấu hình từ .env để tạo transporter.

Cung cấp hàm sendReminderEmail để gửi email với nội dung HTML tùy chỉnh.

backend/scheduler/reminderJob.js:

Sử dụng node-cron để lên lịch chạy các tác vụ tự động.

Job Hàng Ngày (00:01):

processRepeatingReminders: Xử lý các reminder lặp lại (khác feeding), tạo bản ghi mới cho chu kỳ tiếp theo và gửi email thông báo khi tạo mới thành công. Đồng thời cập nhật bản ghi cũ thành status='done'.

processExpiredNoneReminders: Xóa các reminder đơn lẻ (khác feeding) đã quá hạn (reminder_date < ngày hiện tại).

Job 5 Phút:

processFeedingReminders: Quản lý trạng thái is_read của feeding reminders hôm nay (đặt thành false khi sắp đến giờ), tạo các bản ghi "instance" (frequency='none') cho giờ ăn hôm nay, gửi email thông báo khi is_read được đặt thành false, xóa các instance đã quá giờ, và dọn dẹp instance của ngày hôm qua.

Luồng Hoạt động và Logic 🔄
Tạo Thủ công:

Người dùng tạo reminder qua frontend (ví dụ: Reminder.jsx).

API POST /api/reminders nhận yêu cầu, validate, tạo reminder_id, và lưu vào DB với status='pending', is_read=false.

Hiển thị và Trạng thái "Mới":

API GET /api/reminders lấy danh sách reminders.

Hàm calculateDisplayFields được gọi cho từng reminder:

Tính display_title (Tên pet + Loại reminder + Chi tiết nếu có).

Tính subtitle (Due today, Due tomorrow, Due in X days, Overdue by X days,... kèm giờ nếu là feeding).

Tính is_new_today: Kiểm tra nếu DATE(created_at) là ngày hôm nay VÀ is_read là false.

Frontend (PetOwnerDashBoard.jsx, HomePage.jsx) sử dụng cờ is_new_today để hiển thị dấu chấm đỏ thông báo.

Đánh dấu Đã đọc:

Khi người dùng rời khỏi trang Dashboard (PetOwnerDashBoard.jsx), nếu có reminder mới (is_new_today=true), một yêu cầu PUT /api/reminders/mark-read/today được gửi đi.

API này cập nhật is_read = TRUE cho tất cả các reminder được tạo trong ngày hôm đó và đang có is_read = FALSE.

Xử lý Tự động (Cron Job):

Feeding (Mỗi 5 phút):

Kiểm tra các feeding instance của hôm nay. Nếu sắp đến giờ (< 1 tiếng), đặt is_read = false và gửi email thông báo. Nếu còn xa (> 1 tiếng), đặt is_read = true.

Kiểm tra các reminder gốc (daily/none hôm nay). Nếu đến thời điểm (trong vòng 1h trước giờ hẹn), tạo một bản ghi instance mới (frequency='none', reminder_date=today, is_read=false).

Xóa các feeding instance của hôm nay nếu giờ hiện tại đã qua feeding_time.

Xóa các feeding instance của ngày hôm qua.

Lặp lại (Khác Feeding - 00:01 hàng ngày):

Tìm các reminder lặp lại (frequency != 'none') có reminder_date <= today.

Tính ngày hẹn tiếp theo.

Nếu chưa qua end_date và chưa tồn tại reminder cho ngày tiếp theo: Tạo bản ghi reminder mới cho ngày đó (status='pending', is_read=false) và gửi email thông báo.

Cập nhật bản ghi reminder cũ thành status='done', is_read=true.

Đơn lẻ (Khác Feeding - 00:01 hàng ngày):

Xóa các reminder frequency='none' có reminder_date < today.

Email Thông báo ✉️
Feeding: Email được gửi mỗi ngày một lần khi cron job 5 phút phát hiện giờ cho ăn sắp đến và chuyển is_read thành false.

Repeating (Non-Feeding): Email được gửi một lần khi cron job hàng ngày tạo thành công bản ghi reminder mới cho chu kỳ tiếp theo.

Nội dung email được định dạng HTML (xem ví dụ trong reminderJob.js). Email được gửi từ địa chỉ EMAIL_USER đến địa chỉ email của người dùng sở hữu thú cưng đó (lấy từ bảng Users).