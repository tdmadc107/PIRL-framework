# Bắt đầu tại đây

Repo này là PIRL (Plan – Implement – Review Layer): Hub điều phối công việc
phát triển phần mềm cho AI Agent. Framework chạy hoàn toàn bằng file
instruction: ba layer Plan, Implement, Review quy định Agent làm gì, làm thế
nào và đầu ra là gì. `.repos/*` là các git submodule của repo sản phẩm, mỗi
repo có lịch sử và nhánh riêng; danh sách repo đăng ký nằm trong
`.repos/manifest.yaml`.

Luôn áp dụng [quy tắc lõi](.agents/llm-docs/rules/core-agent.rule.md) về an
toàn, phạm vi và bằng chứng, kể cả khi không mở layer nào.

# Cấu trúc

```text
AGENTS.md                         gốc: cấu trúc, luồng, vai trò Agent, định tuyến repo
.agents/
  instructions/
    layered-task-execution.instructions.md   router: chọn layer, hợp đồng chung
    plan.instructions.md                     layer Plan
    implement.instructions.md                layer Implement
    review.instructions.md                   layer Review
  llm-docs/
    rules/        quy tắc dùng chung (core-agent, test-verification)
    repos/        tài liệu ngữ cảnh từng repo đã đăng ký (tạo khi cần)
    evals/        validator Plan/Review và test của nó
  plan/           đầu ra Plan: <request-slug>_<YYYYMMDD-HHmmss>/<NN>-plan-...md
  review/         đầu ra Review: <plan-set>/<task>/round-<NN>-review-...md
.repos/
  manifest.yaml   registry repo sản phẩm
  <repo-id>/      git submodule của repo sản phẩm
tools/            công cụ cục bộ (dashboard, claude-resume, claude-schedule)
tmp/              đầu ra tạm, bị Git ignore (ảnh layout, log công cụ)
```

| Nguồn | Sở hữu |
| --- | --- |
| `AGENTS.md` | Cấu trúc, luồng, danh mục vai trò, định tuyến repo, lệnh kiểm tra |
| Router | Cách chọn layer, ranh giới layer, hợp đồng chung (kiểm chứng bằng lập luận, layout, dọn tài nguyên) |
| Layer instruction | Trình tự, vai trò, đầu ra và điều kiện kết thúc của một layer |
| Rule | Một ràng buộc dùng lại cho nhiều layer |
| `.repos/manifest.yaml` | Repo nào được đăng ký, nằm ở đâu, dùng lệnh và tài liệu nào |

Mỗi quy tắc chỉ nằm ở một nơi sở hữu; file khác trỏ tới đó, không sao chép.

# Cách trình bày khi trả lời

Áp dụng cho mọi câu trả lời, tóm tắt và báo cáo gửi người dùng trong phiên.
Mục tiêu là người dùng hiểu đúng ý ngay lần đọc đầu và biết mình cần xác nhận gì.

- Trả lời thẳng câu được hỏi trước, trong một hai câu; chi tiết đặt sau.
  Có nhiều câu hỏi thì trả lời theo đúng thứ tự người dùng hỏi.
- Mỗi issue, bug, rủi ro hoặc mục cần quyết định trình bày theo thứ tự:
  tình huống cụ thể (ai, thao tác gì, khi nào) → hậu quả người dùng hoặc dữ
  liệu gặp phải → nguyên nhân → đã làm gì hoặc đề xuất gì → điều cần người
  dùng quyết định. Mỗi phần một hai câu; bỏ phần không có.
- Gọi đúng tên đối tượng (người gửi, người nhận, chủ sở hữu cũ, trường
  `ownerId`...). Không dùng đại từ, ẩn dụ hay từ tự đặt (như "dấu",
  "nó") khi có thể hiểu nhầm. Một thuật ngữ chỉ mang một nghĩa trong cả câu
  trả lời.
- Với rủi ro, nêu điều kiện xảy ra thực tế (ai làm, cần thao tác gì, cửa sổ
  thời gian) và mức hậu quả, để người dùng tự đánh giá khả năng gặp phải.
- Câu ngắn, mỗi câu một ý, dùng từ chính xác. Không văn hoa, không lặp lại,
  không mở rộng sang việc người dùng không hỏi.
- Tách rõ điều đã kiểm chứng, điều suy luận và điều đề xuất. Sai sót trong
  câu trả lời trước thì đính chính rõ chỗ sai.
- Chỉ đưa tên hàm, đường dẫn, ID khi người dùng cần chúng để xác nhận hoặc
  tra cứu.

# Luồng làm việc

Plan → Implement → Review. Mỗi layer chỉ chạy khi người dùng yêu cầu; không
layer nào tự mở layer kế tiếp.

| Layer | Kết quả | Hợp đồng |
| --- | --- | --- |
| Plan | Các file Plan: REQ, cách làm, vai trò, tiêu chí chất lượng (QG) | [plan.instructions.md](.agents/instructions/plan.instructions.md) |
| Implement | Source/tài liệu/test đã sửa và Implementation Record trong file Plan | [implement.instructions.md](.agents/instructions/implement.instructions.md) |
| Review | Report `Business` + `Evaluations` đối chiếu QG bằng lập luận trên source | [review.instructions.md](.agents/instructions/review.instructions.md) |

Thứ tự nạp:

1. Đọc [router](.agents/instructions/layered-task-execution.instructions.md);
   router sở hữu cách xác định loại việc và ranh giới giữa chúng.
2. Theo loại việc router xác định:
   - Plan, Implement hoặc Review: đọc đúng hợp đồng layer router trỏ tới.
   - [Task độc lập](.agents/instructions/layered-task-execution.instructions.md#task-độc-lập),
     tức việc giao thẳng ngoài chuỗi của một Plan: không kích hoạt layer.
   - [Bảo trì framework](.agents/instructions/layered-task-execution.instructions.md#bảo-trì-framework):
     sửa chính `AGENTS.md`, instruction, rule hoặc công cụ theo phạm vi người dùng giao.
   - Câu hỏi chỉ cần giải thích, không tạo đầu ra bền vững: trả lời đúng phạm
     vi, không tạo file.
3. Với việc chạm repo sản phẩm, đọc [định tuyến repo](#định-tuyến-repo) rồi nạp
   tài liệu ngữ cảnh và rule của đúng repo đích.

Không có yêu cầu layer thì làm trực tiếp theo yêu cầu với quy tắc lõi, không
tạo Plan hay report. Yêu cầu lập Plan thì Agent tự chọn đội vai trò nhỏ nhất đủ
chuyên môn và ghi trong Plan; người dùng chỉ định vai trò thì giữ đúng danh sách.

Mọi layer và Agent tuân thủ
[trách nhiệm dọn tài nguyên tạm](.agents/instructions/layered-task-execution.instructions.md#dọn-tài-nguyên-tạm-trước-bàn-giao)
trước bàn giao, kể cả khi làm việc độc lập hoặc bảo trì framework.

# Vai trò AI Agent

Mỗi layer giao việc cho AI Agent theo vai trò, đúng chuyên môn cần cho phần
việc. Bảng này là danh mục duy nhất của ID vai trò; trách nhiệm cụ thể của
vai trò tại từng layer nằm trong file layer tương ứng. Cột `Dùng ở` cho biết
vai trò được chọn ở đâu: `plan`, `implement`, `verify` (kiểm chứng QG ở
Implement) hoặc `review`.

| ID | Chuyên môn | Dùng ở |
| --- | --- | --- |
| `business-analyst` | Logic nghiệp vụ, REQ, QG, quyết định sản phẩm còn thiếu | plan, review |
| `solution-architect` | Hợp đồng API/dữ liệu, ownership, ranh giới và phụ thuộc giữa task | plan, review |
| `code-analyst` | Lần luồng dữ liệu/điều khiển, caller/consumer, tác động tới tài liệu | plan, verify, review |
| `implementer` | Viết/sửa source, tài liệu đi kèm và test theo FUT | implement |
| `code-reviewer` | Phản biện diff: bug, hồi quy, quyền, mất nhất quán dữ liệu/trạng thái | verify, review |
| `safeguard-auditor` | Guard, validator, xử lý lỗi, tín hiệu thành công có phân biệt đúng/sai thật không | verify |
| `scenario-designer` | Bảng kịch bản trên giấy từ hợp đồng, lần từng kịch bản qua source | verify |

Nguyên tắc giao việc, áp dụng cho cả ba layer:

- Người điều phối (Agent nhận yêu cầu từ người dùng) chịu trách nhiệm kết quả
  cuối: giao việc, hợp nhất theo bằng chứng, không theo số vai trò đồng ý.
- Giao cho agent riêng (sub-agent của host) khi host cho phép và có một câu hỏi
  độc lập hữu ích. Truyền đủ nguồn, ràng buộc, hướng đã chốt và phần cần xét;
  không giấu giải pháp, không áp đặt kết luận.
- Host không có khả năng giao việc thì người điều phối đảm nhận lần lượt từng
  vai trò theo thứ tự layer và ghi đó là tự thực hiện. Thiếu khả năng giao việc
  không chặn công việc.
- Mô tả vai trò không chứng minh agent độc lập. Tự kiểm tra được ghi đúng là
  tự kiểm tra; không tuyên bố đã có phản biện hay kiểm chứng độc lập khi chưa có.
- Một vai trò không kiểm chứng phần chính nó làm ra.

# Định tuyến repo

`.repos/manifest.yaml` là registry duy nhất của repo sản phẩm. Mỗi repo là một
git submodule tại `.repos/<repo-id>` và có một mục dưới khóa `repos`:

| Trường | Ý nghĩa |
| --- | --- |
| `path` | Thư mục làm việc của repo, tương đối với gốc Hub (thường `.repos/<repo-id>`) |
| `product` | Sản phẩm repo phục vụ |
| `stack` | Ngăn xếp chính |
| `keywords` | Từ khóa yêu cầu dùng để chọn repo |
| `commands` | Tên lệnh → lệnh chạy, dùng khi Plan giao test theo FUT |
| `context_docs` | Tài liệu ngữ cảnh của repo, thường `.agents/llm-docs/repos/<repo-id>.md`: kiến trúc, quy ước, khổ màn hình và ngôn ngữ giao diện cần chụp layout, nơi ghi khoảng trống đã biết |
| `rules` | Rule áp dụng cho repo, thường `.agents/llm-docs/rules/<tên>.rule.md` |

Đăng ký repo: thêm submodule (`git submodule add <url> .repos/<repo-id>`), thêm
mục vào manifest, rồi tạo tài liệu ngữ cảnh và rule nếu cần. Gỡ đăng ký làm
ngược lại: `git submodule deinit -f` và `git rm` đường dẫn submodule, xóa mục
manifest và các tài liệu chỉ phục vụ repo đó.

Một repo **đã đăng ký** khi có đủ hai phần: mục trong manifest, và submodule
khai báo trong `.gitmodules` tại đúng `path` của mục đó. Thiếu một trong hai là
đăng ký dở: repo đó chưa được định tuyến, validator Plan từ chối `target_repo`
trỏ tới nó, và dashboard cảnh báo cho tới khi bổ sung phần thiếu.

Chọn repo cho một yêu cầu:

1. Đọc manifest; chọn repo đã đăng ký có `id`, `path` hoặc `keywords` khớp yêu cầu. Chỉ nạp
   `context_docs` và `rules` của repo được chọn.
2. Chọn đúng một repo, trừ khi yêu cầu nêu rõ nhiều repo; khi đó xử lý và ghi
   từng repo riêng, kể cả hợp đồng giữa các repo.
3. Hai repo cùng hợp lý và lựa chọn làm khác kết quả thì hỏi một câu ngắn. Phân
   tích tiếp được an toàn thì nêu giả định và làm tiếp.
4. Không áp quy tắc hay giả định của repo này cho repo khác, kể cả khi hai repo
   cùng ngăn xếp: lệnh, cấu trúc thư mục và quy ước phải đọc lại từ repo đích.

Manifest chưa có repo nào thì yêu cầu chạm repo sản phẩm chưa thể định tuyến:
nói rõ và đề nghị đăng ký repo trước.

# Kiểm tra framework

Chọn kiểm tra theo thay đổi. Chúng chỉ xác nhận đầu vào và đầu ra bàn giao, không
chấm chất lượng câu chữ; nội dung hướng dẫn được đọc lại với tình huống gây lỗi.

```powershell
python -B .agents/llm-docs/evals/validate_layer_artifact.py --kind <plan|review> --path <file hoặc thư mục>
python -B -m unittest discover -s .agents/llm-docs/evals/tests -p "test_*.py"
```

Lệnh đầu kiểm tra file Plan/Review (schema, trường bắt buộc, vai trò, phụ
thuộc, múi giờ) và chạy khi bàn giao chúng. Lệnh sau là test của validator,
chỉ chạy khi sửa chính validator.

# Git và submodule

Chỉ commit hoặc push khi người dùng yêu cầu. Thay đổi trong `.repos/<tên>`
commit trong chính submodule đó trước; sau đó commit ở Hub để cập nhật con trỏ
submodule, kèm Plan/report của cùng task nếu có.
