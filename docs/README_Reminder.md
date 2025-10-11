# Reminder API

Run:
1. npm install
2. npm start

Endpoints (JSON):
- GET /reminders
- GET /reminders/:id
- POST /reminders  { title, message?, time (ISO) }
- PUT /reminders/:id
- DELETE /reminders/:id

Scheduler: chạy mỗi 30s, log reminders đến hạn và đánh dấu sent.

## Troubleshooting

- Nếu GET /reminders trả về [] thì hiện không có reminder nào lưu — API hoạt động nhưng datastore rỗng.
- Kiểm tra server đang chạy:
  - GET /health nên trả về { "status": "ok" }.
  - Xem log console khi khởi động (port, lỗi).
- Kiểm tra file dữ liệu (mặc định): d:\PetCare\data\reminders.json — nếu tồn tại, mở xem trường "reminders" có phần tử hay không.

## Quick test (ví dụ)

1. Tạo reminder:
    mở command prompt
   - curl:
    ```
    curl -i -X POST "http://localhost:3000/reminders" -H "Content-Type: application/json" -d "{\"title\":\"Test\",\"message\":\"Hello\",\"time\":\"2025-10-11T12:00:00.000Z\"}"
    ```
2. Kiểm tra list:
   - curl http://localhost:3000/reminders

Nếu sau POST list vẫn rỗng:
- Kiểm tra response của POST (status 201 và body chứa object).
- Kiểm tra quyền ghi/đọc trên thư mục d:\PetCare\data và file reminders.json.
- Kiểm tra mã server có dùng cùng file dữ liệu như README mô tả.

## Test cases (TC8 / TC9 / TC10) — hướng dẫn thực hiện

ID | mô tả | steps (command) | expected result | ghi chú
---|---:|---|---|---
TC8 | Add reminder | 1) POST tạo reminder<br>Linux/macOS (bash):<br>`curl -i -X POST "http://localhost:3000/reminders" -H "Content-Type: application/json" -d '{"title":"Vaccination","message":"For pet A","time":"2025-10-20T09:00:00.000Z"}'`<br>2) GET list: `curl http://localhost:3000/reminders` | POST trả về 201 với body là object reminder (có id). GET trả về mảng chứa reminder vừa tạo. | Nếu GET trả [], kiểm tra response của POST và file d:\PetCare\data\reminders.json
TC9 | Update reminder status (mark done) | 1) Lấy id từ kết quả POST hoặc GET.<br>2) PUT update sent (Windows CMD example):<br>`curl -i -X PUT "http://localhost:3000/reminders/{id}" -H "Content-Type: application/json" -d "{\"sent\":true}"`<br>3) GET /reminders/:id or GET /reminders | PUT trả về object đã cập nhật với `sent:true`. GET cho thấy `sent:true`. | Hiện model dùng `sent` boolean. Nếu test case yêu cầu field `status` hoặc giá trị khác, nên mở rộng model (thêm `status: "done"`).
TC10 | Delete reminder | `curl -i -X DELETE "http://localhost:3000/reminders/{id}"` then `curl http://localhost:3000/reminders` | DELETE trả về object bị xóa. GET không còn chứa item đó. File reminders.json phản ánh thay đổi. | Kiểm tra mã trả về (200) và file dữ liệu để xác nhận persistence.

### Ví dụ chi tiết (Windows CMD)
- Tạo:
  curl -i -X POST "http://localhost:3000/reminders" -H "Content-Type: application/json" -d "{\"title\":\"Vaccination\",\"message\":\"For pet A\",\"time\":\"2025-10-20T09:00:00.000Z\"}"
- Update (mark done):
  curl -i -X PUT "http://localhost:3000/reminders/b3b5c01a-4617-4e54-8d4d-8e51a27f07a7" -H "Content-Type: application/json" -d "{\"sent\":true}"
- Delete:
  curl -i -X DELETE "http://localhost:3000/reminders/b3b5c01a-4617-4e54-8d4d-8e51a27f07a7"

### Mapping nhanh API → TC
- TC8 (Add): supported by POST /reminders — PASS if POST returns 201 and GET shows item.
- TC9 (Update status): supported by PUT /reminders/:id (can set `sent: true`) — PASS if PUT updates `sent`. If test requires different field/semantics, add `status`.
- TC10 (Delete): supported by DELETE /reminders/:id — PASS if DELETE returns the item and GET no longer lists it.

### Gợi ý nếu test fail
- Nếu nhiều concurrent requests → hiện tại file-based store dùng synchronous write (đơn giản) có thể bị race; cần chuyển sang DB hoặc lock cơ chế.
- Nếu test yêu cầu explicit "done" status string → thêm `status` field và endpoint /reminders/:id/complete.
- Để scheduler tự mark done khi time <= now: tạo reminder với time ở quá khứ và xem scheduler log / `sent` cập nhật.
