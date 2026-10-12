---
id: .agents/llm-docs/rules/test-verification
kind: rule
version: 6.0.0
status: active
---

# Test And Verification Rules

Quy trình trong ba layer chỉ thuộc
[Plan](../../instructions/plan.instructions.md),
[Implement](../../instructions/implement.instructions.md) và
[Review](../../instructions/review.instructions.md).
Mục Quy tắc FUT áp dụng cho mọi việc viết, cập nhật và chạy test, trong và
ngoài ba layer. Các mục còn lại chỉ dùng cho công việc ngoài ba layer.

## Quy tắc FUT (test chức năng)

Test được tạo mới hoặc cập nhật phải là test chức năng dựa trên REQ/đặc tả.
Người dùng yêu cầu rõ khác thì làm theo yêu cầu đó.

- Nguồn: mỗi test truy về một REQ hoặc mục đặc tả của chức năng đang phát
  triển, hoặc của chức năng bị nó ảnh hưởng. "Bị ảnh hưởng" phải có căn cứ
  trong source: call path, hợp đồng hay dữ liệu dùng chung mà thay đổi chạm
  tới; không suy từ tên module, sự tồn tại của test hay ý muốn "cho chắc".
- Nội dung: khẳng định hành vi chức năng quan sát được tại hợp đồng của chức
  năng (đầu vào → kết quả/trạng thái, nhánh từ chối/lỗi mà đặc tả nêu).
  Không khóa chi tiết cài đặt, không lấy thuật toán của implementation làm
  kết quả mong đợi, không khẳng định điều đặc tả không yêu cầu (câu chữ, thứ
  tự, thời gian, định dạng) khiến kết quả đúng bị chặn.
- Mức độ: chỉ đủ test để phân biệt đúng/sai cho hành vi được giao. Không
  thêm tổ hợp, biên, hiệu năng hay nền tảng mà đặc tả không đòi, không test
  trùng một hành vi, không lan sang chức năng không liên quan. Test hiện có
  đã bảo vệ hành vi đó thì cập nhật nó thay vì viết bản mới.
- Cập nhật: test của chức năng bị ảnh hưởng còn khẳng định hành vi cũ được
  sửa theo logic mới; test chỉ phục vụ luồng đã gỡ thì xóa.
- Chạy: chỉ chạy test của chức năng đang phát triển và chức năng bị ảnh
  hưởng, chọn theo file, class hoặc tên test. Tuyệt đối không chạy test của
  chức năng không liên quan hay toàn bộ suite/hệ thống, kể cả khi cho rằng
  thay đổi không gây ảnh hưởng. Biên dịch do chính lệnh chạy test đó thực
  hiện là một phần của lần chạy, không là việc build riêng.
- Kết quả: lần chạy chỉ chứng minh case đã chạy. Test đỏ được giải thích bằng
  source (sản phẩm sai hay test sai) trước khi sửa đúng bên; trong chuỗi Plan
  → Implement → Review, kết quả test không là baseline của QG.

## Verification Levels

Dùng cho công việc ngoài ba layer.

| Level | Use When | Examples |
|---|---|---|
| Static | Kiểu, lint, cú pháp, metadata | trình biên dịch, linter, kiểm tra kiểu |
| Unit | Hàm thuần, service, quy tắc miền | test của một hàm hoặc service |
| Component | Hành vi giao diện và khả năng truy cập | test component |
| Integration | API, xác thực, lưu trữ, luồng nhiều tầng | test API, test với lưu trữ thử |
| Manual | Bố cục trực quan, trình duyệt thật, luồng nhiều bước | kiểm tra theo khổ màn hình |

## Selection Rule

Chọn kiểm chứng hẹp nhất trả lời được câu hỏi chưa rõ. Chỉ mở rộng khi một hợp
đồng bị ảnh hưởng hoặc cơ chế lỗi cụ thể đòi hỏi; tên file hay sự tồn tại của
test không tạo ra nhu cầu đó.

Với nội dung hướng dẫn, đọc quy tắc với tình huống gây lỗi và một tình huống
gần giống mà nó không được áp dụng, kiểm tra chủ sở hữu và hướng dẫn mâu thuẫn.
Không tạo test hay validator để chấm câu chữ theo tiêu đề, từ khóa, số đếm hay
định dạng. Tôn trọng yêu cầu loại trừ test/validator mới của task.

Một case bị bỏ qua do nền tảng chỉ chứng minh case đó không chạy trong môi
trường này; không chứng minh sản phẩm cần thêm nền tảng. Suy ra yêu cầu môi
trường từ task của người dùng và hành vi được hỗ trợ thực tế của repo.

Lệnh đạt chỉ chứng minh các case đã chạy, không chứng minh độ phủ bất biến,
đường ghép liền kề, hành vi biên hay độ tin cậy của phần bị bỏ qua.

## Reporting

Ghi:

- lệnh;
- mục đích;
- thư mục chạy;
- pass/fail/blocker;
- tóm tắt đầu ra chính;
- rủi ro còn lại.
