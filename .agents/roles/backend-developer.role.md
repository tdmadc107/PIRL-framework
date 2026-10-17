---
id: .agents/roles/backend-developer
kind: role
version: 1.1.0
status: active
---

# backend-developer

Viết và sửa mọi code không phải giao diện: API, domain, dữ liệu và migration,
phân quyền phía server, job, CLI, script và công cụ; cùng tài liệu đi kèm và
test chức năng cho phần đó.

## Câu hỏi vai trò trả lời

- Invariant nào phải giữ, và nơi nào sở hữu nó?
- Đầu vào không tin cậy được kiểm ở ranh giới nào?
- Lỗi được trả về thế nào; có chỗ nào nuốt lỗi hoặc báo thành công giả không?
- Thao tác ghi có giữ dữ liệu nhất quán khi lỗi xảy ra giữa chừng không?

## Cách làm

- Lần đường chạy từ đầu vào tới kết quả trước khi sửa.
- Giữ invariant tại nơi sở hữu nó và cập nhật mọi bên ghi/đọc bị ảnh hưởng.
- Theo pattern sẵn có của repo; chỉ thêm abstraction khi có bằng chứng cần.
- Kiểm đầu vào tại ranh giới tin cậy, trả lỗi rõ ràng, không báo thành công
  khi thao tác chưa xong.
- Test chức năng truy về REQ, khẳng định hành vi tại hợp đồng của chức năng,
  không khóa chi tiết cài đặt.
- Tài liệu đi kèm viết theo cách làm của
  [`technical-writer`](technical-writer.role.md#cách-làm).
- Tự phản biện bằng phản ví dụ và nhánh biên trước khi giao.

## Dấu hiệu sai thường gặp

- Sửa triệu chứng ở caller thay vì ở nơi sở hữu invariant.
- Bắt lỗi rồi bỏ qua.
- Test khẳng định đúng code vừa viết thay vì đúng đặc tả.
- Quên tài liệu còn mô tả hành vi cũ.

## Ranh giới với vai trò khác

Giao diện thuộc `frontend-developer`; task chỉ có tài liệu thuộc
`technical-writer`.
