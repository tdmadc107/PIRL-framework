# PIRL Framework

**Plan – Implement – Review Layer**: Hub điều phối công việc phát triển phần
mềm cho AI Agent, chạy hoàn toàn bằng file hướng dẫn (instruction).

Bạn giao việc bằng lời. Agent đọc [`AGENTS.md`](AGENTS.md), chọn đúng layer,
chia việc cho các vai trò chuyên môn, ghi kết quả thành file trong repo, rồi tự
cải tiến chính các file hướng dẫn sau mỗi lượt.

## Framework làm gì

- **Ba layer.** Plan chốt việc cần làm và tiêu chí chất lượng (QG). Implement
  sửa source theo Plan. Review đối chiếu kết quả với QG bằng lập luận trên
  source.
- **Nhiều repo.** Mỗi repo sản phẩm là một git submodule trong `.repos/` và được
  đăng ký trong `.repos/manifest.yaml`.
- **Vai trò AI Agent.** Mỗi layer giao việc cho vai trò đúng chuyên môn, ví dụ
  `business-analyst`, `backend-developer`, `code-reviewer`.
- **Tự cải tiến.** Cuối mỗi lượt layer, vai trò `process-auditor` tìm lỗi của
  từng vai trò, sửa tận gốc file hướng dẫn liên quan, ghi một record JSONL và báo
  lại đã sửa gì, ở đâu.

Framework không build, không chạy ứng dụng để nghiệm thu và không deploy. Các
việc đó thuộc giai đoạn build/test/release của bạn. Implement chỉ viết và chạy
test chức năng liên quan tới yêu cầu, và chụp layout bằng mock khi giao diện
thay đổi.

## Yêu cầu

- Một AI Agent đọc được file trong repo và chạy được lệnh, ví dụ Claude Code.
  Host tự nạp `AGENTS.md` thì dùng ngay; host không tự nạp thì yêu cầu Agent đọc
  `AGENTS.md` trước khi giao việc.
- Git.
- Python 3.9 trở lên, cho validator và công cụ ghi record.
- Node.js (khuyến nghị 20 trở lên), nếu dùng dashboard.
- PowerShell 7 (`pwsh`) trên Windows, nếu dùng `claude-resume` hoặc
  `claude-schedule`.

## Bắt đầu nhanh

### 1. Lấy Hub về máy

```powershell
git clone --recurse-submodules https://github.com/tdmadc107/PIRL-framework.git
```

### 2. Đăng ký repo sản phẩm

Bạn có thể nhờ Agent làm bước này, ví dụ: "Đăng ký repo `<url>` với id
`shop-web`". Làm tay gồm hai phần:

```powershell
git submodule add <url> .repos/shop-web
```

Rồi thêm mục vào `.repos/manifest.yaml`. Khi thêm mục đầu tiên, thay
`repos: {}` bằng `repos:`.

```yaml
schema: "pirl-repos/v1"
repos:
  shop-web:
    path: ".repos/shop-web"
    product: "Cửa hàng trực tuyến"
    stack: "React + Node.js"
    keywords: ["cửa hàng", "giỏ hàng", "thanh toán"]
    commands:
      test: "npm test -- <file test>"
    context_docs: [".agents/llm-docs/repos/shop-web.md"]
    rules: []
```

Repo chỉ được coi là đã đăng ký khi có cả submodule lẫn mục trong manifest.
Thiếu một trong hai thì Agent chưa định tuyến tới repo đó, và dashboard cảnh báo.

Nên có thêm tài liệu ngữ cảnh `.agents/llm-docs/repos/shop-web.md`, gồm: kiến
trúc, quy ước, ngôn ngữ giao diện và khổ màn hình cần chụp layout, khoảng trống
đã biết. Có thể giao Agent soạn tài liệu này như một task độc lập.

### 3. Giao việc

Không cần lệnh hay từ khóa đặc biệt; nói bằng lời:

| Bạn muốn | Ví dụ câu giao việc | Agent chạy |
| --- | --- | --- |
| Lập kế hoạch | "Lập Plan cho yêu cầu: khách hàng nhận email khi đơn hàng bị hủy" | Plan |
| Triển khai | "Triển khai Plan T01 trong `.agents/plan/<gói>`" | Implement |
| Review | "Review phần triển khai của Plan T01" | Review |
| Sửa theo Review | "Sửa theo report `<đường dẫn report>`" | Implement, lượt sửa |
| Việc nhỏ ngoài chuỗi | "Cập nhật tài liệu ngữ cảnh của shop-web" | Task độc lập |
| Sửa chính framework | "Sửa quy tắc dọn tài nguyên trong router" | Bảo trì framework |
| Chỉ hỏi | "Plan T01 phụ thuộc vào task nào?" | Trả lời, không tạo file |

Mỗi layer chỉ chạy khi bạn yêu cầu; Agent không tự chuyển sang layer kế tiếp.
Agent tự chọn đội vai trò nhỏ nhất đủ chuyên môn. Muốn chỉ định đội, nêu tên vai
trò trong câu giao việc; danh mục vai trò nằm ở
[`AGENTS.md`](AGENTS.md#vai-trò-ai-agent).

## Một vòng làm việc đầy đủ

1. **Plan.** Agent khảo sát source và hỏi khi thiếu quyết định sản phẩm. Kết
   quả là một gói Plan trong `.agents/plan/<request-slug>_<YYYYMMDD-HHmmss>/`,
   mỗi task một file gồm: Cần làm gì (REQ), Làm như thế nào, Vai trò tham gia,
   Tiêu chí chất lượng bắt buộc (QG). Hãy đọc và chốt Plan trước khi triển khai.
2. **Implement.** Agent sửa source trong repo sản phẩm, đúng phạm vi Plan. Vai
   trò kiểm chứng kết luận từng QG bằng lập luận trên source. Kết quả ghi vào mục
   `Implementation Record` ở cuối file Plan. Khi giao diện thay đổi, ảnh layout
   nằm trong `.tmp/layout-snapshots/` (không vào git).
3. **Review.** Agent đối chiếu từng QG trên source và ghi report vào
   `.agents/review/<plan-set>/<task>/round-<NN>-review-...md`. Report có hai mục:
   `Business` (kết luận PASS, FAIL hoặc BLOCKED cùng các FIND, RISK, BLOCK) và
   `Evaluations` (đánh giá từng vai trò của lượt Implement).
4. **Sửa.** Khi Business FAIL, giao "Sửa theo report ...". Implement chạy lượt
   sửa với đội ghi trong report, rồi bạn yêu cầu Review vòng mới.
5. **Commit.** Agent chỉ commit hoặc push khi bạn yêu cầu. Thay đổi trong repo
   sản phẩm được commit trong submodule trước; sau đó commit ở Hub gồm con trỏ
   submodule, Plan, report, record và cải tiến framework của cùng lượt.

## Đọc phần tự cải tiến sau mỗi lượt

Cuối mỗi lượt Plan, Implement hoặc Review, phản hồi của Agent có:

- **Tự cải tiến:** mã record, và với mỗi cải tiến đã áp dụng: lỗi, nguyên nhân,
  file và mục đã sửa, version cũ → mới. Hãy xem diff các file này trước khi
  commit.
- **Tự đánh giá cần bạn quyết định:** xuất hiện trong hai trường hợp. Một là
  Agent không giao được việc đánh giá cho một agent riêng, nên đã tự đánh giá
  chính mình. Hai là cải tiến sẽ làm lỏng một quy tắc an toàn. Bạn chọn áp dụng,
  bỏ qua, hoặc cho đánh giá lại bằng agent riêng.

Quy tắc an toàn (commit, push, secret, thao tác phá hủy, các điểm cần bạn quyết
định) không bao giờ bị tự cải tiến làm lỏng khi chưa có bạn đồng ý. Định nghĩa
đầy đủ nằm trong
[`core-agent.rule.md`](.agents/llm-docs/rules/core-agent.rule.md#safety-rules-and-self-improvement).

Record nằm trong `.agents/records/<layer>/<YYYY-MM-DD>.jsonl`. Tra lịch sử:

```powershell
python -B .agents/llm-docs/evals/layer_record.py query --issue-key <khóa lỗi>
python -B .agents/llm-docs/evals/layer_record.py query --layer review --plan-set <gói> --task T01
python -B .agents/llm-docs/evals/layer_record.py check
```

## Công cụ cục bộ

- **Dashboard:** theo dõi phiên Claude Code, hạn mức, tiến độ Plan/Review, thay
  đổi file và git của Hub cùng mọi repo, và cảnh báo repo đăng ký dở. Chạy
  `.tools\dashboard\dashboard.bat` hoặc `node .tools/dashboard/dashboard.js`.
- **claude-resume, claude-schedule:** chạy lại phiên sau khi hạn mức reset, và
  hẹn giờ một task bằng Windows Task Scheduler.

Chi tiết và tham số: [`.tools/README.md`](.tools/README.md).

## Kiểm tra sau khi sửa framework

```powershell
python -B -m unittest discover -s .agents/llm-docs/evals/tests -p "test_*.py"
```

Chọn lệnh kiểm tra theo phần đã sửa: xem
[Kiểm tra framework](AGENTS.md#kiểm-tra-framework).

## Cấu trúc thư mục

```text
AGENTS.md        gốc: cấu trúc, luồng, vai trò, định tuyến repo
.agents/         hướng dẫn layer, vai trò, quy tắc, công cụ, Plan, report, record
.repos/          manifest và submodule của repo sản phẩm
.tools/          dashboard, claude-resume, claude-schedule
.tmp/            đầu ra tạm, không vào git
```

Cây đầy đủ: [`AGENTS.md`](AGENTS.md#cấu-trúc).

## Tài liệu tham chiếu

| Muốn biết | Đọc |
| --- | --- |
| Cấu trúc, luồng, vai trò, đăng ký repo | [`AGENTS.md`](AGENTS.md) |
| Cách chọn layer, hợp đồng chung, tự cải tiến | [Router](.agents/instructions/layered-task-execution.instructions.md) |
| Chi tiết từng layer | [Plan](.agents/instructions/plan.instructions.md), [Implement](.agents/instructions/implement.instructions.md), [Review](.agents/instructions/review.instructions.md) |
| Chuyên môn từng vai trò | [`.agents/roles/`](.agents/roles/) |
| Quy tắc an toàn và test | [`core-agent`](.agents/llm-docs/rules/core-agent.rule.md), [`test-verification`](.agents/llm-docs/rules/test-verification.rule.md) |
| Công cụ cục bộ | [`.tools/README.md`](.tools/README.md) |

## Giấy phép

[MIT](LICENSE).
