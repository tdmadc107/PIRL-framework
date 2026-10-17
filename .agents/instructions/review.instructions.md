---
name: "Hướng dẫn layer Review"
description: "Đối chiếu quality gate của Plan bằng lập luận trên source, không dựa vào build/test, báo Business và Evaluations (đánh giá vai trò Implement, nguyên nhân lỗi và cải tiến đã áp dụng)."
applyTo: ".agents/instructions/review.instructions.md"
metadata:
  id: ".agents/instructions/review"
  kind: "instruction"
  version: "1.2.0"
  status: "active"
---

# Hướng dẫn layer Review

Chỉ áp dụng quy trình Review khi yêu cầu và [router](layered-task-execution.instructions.md)
đã chọn layer này. Đọc hoặc cập nhật một file Plan/report không tự kích hoạt
layer khác.

Đây là nguồn quy trình, mẫu report và điều kiện kết thúc Review theo Plan.
Review phải phân biệt sản phẩm sai, chưa đủ bằng chứng và hướng dẫn khiến
agent quyết định sai. Dùng đúng hai mục `Business` và `Evaluations`; giữ nguyên
ID, symbol, tên vai trò và đường dẫn, diễn giải bằng tiếng Việt dễ hiểu.

## Vai trò AI Agent tại layer Review

Danh mục vai trò và nguyên tắc giao việc nằm ở [AGENTS.md](../../AGENTS.md#vai-trò-ai-agent);
chuyên môn của từng vai trò nằm trong file vai trò được liên kết trong bảng.
Review chọn `review_roles` trong bảng dưới theo cột "Chọn khi", theo thứ tự của
bảng: bốn vai trò đầu là mặc định, thêm `ux-designer` khi diff đổi giao diện.
Mỗi vai trò xử lý chuyên môn của mình theo QG/ranh giới cụ thể, không bắt mỗi
vai trò tìm một lỗi.

| Vai trò | Chọn khi | Trách nhiệm tại Review | Hoàn tất khi |
| --- | --- | --- | --- |
| [`code-analyst`](../roles/code-analyst.role.md) | Mặc định | Lần entrypoint, caller, bên ghi/đọc, cấu hình tới trạng thái cuối của từng QG | Kết luận QG kèm đường đã lần và nguồn |
| [`code-reviewer`](../roles/code-reviewer.role.md) | Mặc định | Phản biện diff: bug, hồi quy, quyền và bảo mật, mất nhất quán, guard/xử lý lỗi, test vi phạm FUT | Nghi vấn được chứng minh thành FIND hoặc bị bác bỏ có nguồn |
| [`business-analyst`](../roles/business-analyst.role.md) | Mặc định | Đối chiếu REQ và `Logic bắt buộc` của QG với hành vi source; chặn tiêu chí tự thêm | Mỗi QG có `PASS\|FAIL\|BLOCKED` đúng REQ |
| [`solution-architect`](../roles/solution-architect.role.md) | Mặc định | Xét hợp đồng, ownership, ranh giới task và phụ thuộc có bị phá không | Nêu được QG bị ảnh hưởng hoặc xác nhận không ảnh hưởng |
| [`ux-designer`](../roles/ux-designer.role.md) | Diff đổi giao diện | Đọc `layout_verification` và ảnh của Implement, đối chiếu QG giao diện | Mỗi QG giao diện có kết luận kèm ảnh và source đã đối chiếu |
| [`process-auditor`](../roles/process-auditor.role.md) | Mọi vòng Review; không ghi vào `review_roles` | Đánh giá lại vai trò Implement (mục Evaluations) và tự đánh giá lượt Review theo [router](layered-task-execution.instructions.md#tự-đánh-giá-và-cải-tiến) | Evaluations bao phủ đội Implement; record đã ghi; cải tiến đã áp dụng hoặc đã tổng hợp cho người dùng |

- Phân xử bất đồng bằng source, hợp nhất nghi vấn cùng nguyên nhân; không bỏ
  phiếu. Agent riêng chỉ hữu ích khi có câu hỏi độc lập; không giả lập giao
  việc, không bắt có nhiều agent mới được kết luận. Khi một agent đảm nhận
  nhiều vai trò, report ghi đó là tự thực hiện.
- Với từng record Implement, phân một chủ đánh giá và đối chiếu chéo khi có
  nghi vấn.

## Đầu vào và quyền

- Đọc đúng Plan `pirl-plan/v1`, Implementation Record, source/diff của lượt
  được giao và report trước cùng task nếu có. Xác định snapshot trước khi kết
  luận; thay đổi hiện tại không tự là bằng chứng về quyết định của một lượt cũ.
- Khi nhiều task của một gói nằm chung một snapshot (cùng commit hoặc cùng bộ
  thay đổi chưa tách được theo task), kết luận mỗi QG trên source cuối và ghi
  snapshot chung trong `implementation_target`. Chỗ lệch với QG của task trước
  mà do task chạy sau đổi trong phạm vi REQ của chính task sau thì không là
  FAIL của task trước. Task sau đổi phần làm vỡ QG của task trước mà nằm ngoài
  REQ của mình thì là FIND của task sau.
- Source sản phẩm, test, config, Plan và Implementation Record là đầu vào chỉ
  đọc. Review ghi report của lượt này; file framework chỉ do `process-auditor`
  sửa theo [router](layered-task-execution.instructions.md#tự-đánh-giá-và-cải-tiến).
  Không sửa sản phẩm, Plan hay Implementation Record.

## Business: chứng minh hoặc bác bỏ từng nghi vấn

1. Lấy QG và `Logic bắt buộc` nguyên từ Plan. REQ và quyết định người dùng
   giải thích tiêu chí; rubric, sở thích reviewer và lỗi hướng dẫn không
   tạo tiêu chí sản phẩm mới.
   Đối chiếu [ranh giới task của Plan](plan.instructions.md#chia-task-để-triển-khai-và-nghiệm-thu-riêng):
   không lấy tiêu chí tích hợp của task khác làm điều kiện PASS task đang
   review. Nếu chính QG cần phần việc giao cho task chạy sau/song song,
   ghi QG đó `BLOCKED`, tạo BLOCK `escalate` về Plan để sửa phân công/QG,
   không giao `repair`/`retry` cùng task chỉ để chờ phần việc kia. Không tự
   bỏ QG hoặc ghi PASS; vẫn đánh giá lỗi triển khai độc lập có đủ bằng chứng.
2. Lần theo entrypoint, caller, guard, bên ghi/đọc, cấu hình và nhánh thất bại
   có thể xảy ra. Xác nhận trigger nằm trong hợp đồng sử dụng. Một hàm nội bộ
   không kiểm tra dữ liệu không chứng minh toàn hệ thống thiếu kiểm tra.
3. Với nghi vấn, nối trigger → cơ chế → hậu quả → QG bị vi phạm. Chủ động tìm
   nguồn bác bỏ, kể cả invariant có chủ đích. Mức độ nghiêm trọng phải dựa
   vào tác động và khả năng tới đường lỗi; tên gọi, regex hoặc một đoạn mã
   không đủ chứng minh deadlock, mất dữ liệu hay lỗi Critical.
4. Kết luận QG bằng lập luận trên source theo
   [router](layered-task-execution.instructions.md#kiểm-chứng-bằng-lập-luận):
   Review không build, không tạo/chạy test, script, mock hay ứng dụng và không lấy
   kết quả test/build, kể cả kết quả ghi trong Implementation Record, làm
   baseline hay bằng chứng PASS/FAIL. Khi diff đổi giao diện, đọc
   `layout_verification` và ảnh mà Implement đã chụp theo
   [kiểm chứng layout bằng mock](layered-task-execution.instructions.md#kiểm-chứng-layout-bằng-mock)
   như nguồn cho QG về giao diện, không chụp lại. Test xanh không chứng minh nghiệp vụ
   đúng, test đỏ không chứng minh sản phẩm sai. Phản ví dụ là đầu vào và
   đường gọi lần được trên source, chỉ hợp lệ nếu có thể xuất hiện trong
   phạm vi QG.
5. Chỉ giữ kết luận đủ căn cứ:
   - `FIND`: bug thực sự vi phạm QG, có trigger, source, nguyên nhân và tác động.
   - `RISK`: cơ chế rủi ro có căn cứ trong khi QG vẫn đạt; ghi giới hạn, chủ
     xử lý và điều kiện xem lại. Risk không bắt sửa hoặc chặn business PASS.
   - `BLOCK`: thiếu nguồn, điều kiện hoặc quyết định cần để kết luận QG;
     nêu bằng chứng thiếu, chủ cung cấp và hành động tiếp tục.
   Nghi vấn bị bác bỏ phải bỏ khỏi finding, không đổi nhãn sang risk để giữ nó.
   Thiếu test, chưa build/chạy hay kết quả test đỏ/xanh không tự là FIND,
   RISK hoặc BLOCK; không đòi thêm test, build hay release. Ngược lại, test
   trong diff vi phạm [quy tắc FUT](../llm-docs/rules/test-verification.rule.md#quy-tắc-fut-test-chức-năng)
   (không truy về REQ/đặc tả, ngoài chức năng đang phát triển và chức năng bị
   ảnh hưởng, trùng lặp thừa, khẳng định trái đặc tả hoặc chặn kết quả đúng)
   là FIND `repair`; trường QG ghi `FUT` cùng REQ liên quan. Diff đổi giao
   diện mà Implementation Record thiếu `layout_verification`, hoặc ảnh cho thấy
   layout vi phạm QG, cũng là FIND `repair` cho vai trò triển khai sở hữu giao diện.
6. Giao chỉ dẫn theo cơ chế cần sửa, file/symbol, thứ tự và kết quả cần giữ;
   chỉ dẫn sửa source, tài liệu hoặc test theo FUT; không giao build hay chạy
   test ngoài phạm vi FUT.
   FIND trong phạm vi Plan dùng `repair`; nếu thay hành vi, đường dẫn hay
   quyết định đã chốt thì dùng `replan`. Khi còn `replan`, để `repair_roles`
   rỗng và bàn giao Plan. Nếu chỉ sửa trong phạm vi, đội sửa gồm đúng các
   vai trò triển khai chịu FIND `repair` và BLOCK `retry`, theo thứ tự bàn giao.
   RISK được trì hoãn; BLOCK `escalate` chuyển chủ. Chỉ giao `retry` khi có
   hành động/điều kiện mới, không mở vòng khác với cùng một blocker.
7. Ghi QG `PASS|FAIL|BLOCKED`. Business `FAIL` khi đã có QG thất bại hoặc
   FIND `FUT`, nếu chưa có thất bại nhưng thiếu căn cứ bắt buộc thì `BLOCKED`,
   còn lại `PASS`. Risk và lỗi hướng dẫn tự thân không đảo ngược kết luận này.

## Evaluations: đánh giá vai trò Implement

Mục này trả lời: mỗi vai trò của lượt Implement được review có làm đúng phần
được giao không, nếu sai thì nguyên nhân gốc là gì và framework đã được cải tiến
ở đâu. `process-auditor` của Review thực hiện mục này cùng phần tự đánh giá lượt
Review, theo [router](layered-task-execution.instructions.md#tự-đánh-giá-và-cải-tiến).
Review biết thêm các FIND mà lượt Implement bỏ sót, nên đây là lần đánh giá có
nhiều bằng chứng hơn lần tự đánh giá của chính Implement.

1. Tìm record của lượt Implement được review bằng
   `python -B .agents/llm-docs/evals/layer_record.py query --layer implement --plan-set <plan-set> --task <task-id>`.
   Trong kết quả, chọn record mới nhất có danh sách `roles` chứa các vai trò
   Implement cần đánh giá và ghi nó vào `evaluates` của record Review. Record chỉ áp
   dụng cải tiến hay đính chính (`supersedes` có giá trị, `roles` chỉ có
   `coordinator`) không là record được đánh giá; nêu nó trong mục Bằng chứng
   của EVAL. Record đính chính mang đủ vai trò thì chính nó được đánh giá.
2. Lập một EVAL cho mỗi vai trò trong `effective_implementation_roles` rồi mỗi
   vai trò kiểm chứng của Plan, đúng thứ tự Implementation Record. Đánh giá theo
   phần việc, thông tin và chỉ dẫn thực sự được giao; không đánh trượt cả đội
   vì một bug. Vai trò kiểm chứng được đánh giá ở kết luận QG của nó: lập luận
   có đứng vững trước source không, có bỏ sót FIND mà Review tìm thấy không, có
   dựa vào kết quả chạy thay lập luận không.
3. Mỗi lỗi của một vai trò Implement được phân loại nguyên nhân và cải tiến theo
   router, ghi vào record Review với `record` là record trong `evaluates`. EVAL
   ghi lại nguyên nhân, `issue_key` và nơi đã sửa, hoặc trạng thái chờ người dùng.
4. Không tạo lỗi giả. Lỗi của vai trò hay hướng dẫn không hạ verdict Business và
   không chặn bàn giao một delivery đã đủ điều kiện; nếu chính report sai, sửa
   report trước khi chốt.

## Mẫu report duy nhất

Dùng Review `pirl-review/v1` tại
`.agents/review/<plan-set>/<task-id-lower>-<todo-slug>/round-<NN>-review-<todo-slug>-<YYYYMMDD-HHmmss>.md`.
Vòng đầu có `prior_review: null`; vòng sau tham chiếu report ngay trước.
Yêu cầu bổ sung phase hoặc bằng chứng cho cùng lượt triển khai thuộc vòng
Review hiện tại: cập nhật report đó, giữ `review_round` và `prior_review`.
Không tăng vòng chỉ vì có tin nhắn, thời điểm kiểm chứng hoặc phạm vi khảo sát
bổ sung. Mở vòng mới khi được giao Review lượt triển khai/sửa tiếp theo hoặc
người dùng yêu cầu rõ vòng độc lập. Khi sửa report đã chốt, ghi lý do sửa
trong report và giữ nguyên các vòng khác.

### Quy tắc trình bày

Giữ hai mục cấp hai `Business` và `Evaluations`; dùng tiêu đề cấp ba/bốn để
chia nội dung bên trong. Trình bày QG bằng bảng ba cột; mỗi FIND/RISK/BLOCK
và EVAL có bảng hai cột `Trường | Nội dung` riêng dưới tiêu đề chứa ID.
Phần `Tiếp theo` dùng bảng hai cột. Không ghép nhiều trường thành một bullet
dài hoặc dồn mọi trường của finding/evaluation vào một bảng quá rộng.

Đây chỉ là cách trình bày: giữ đủ trường, ID, kết luận, bằng chứng và chỉ dẫn;
không rút bớt thông tin để làm bảng ngắn hơn. Trong mỗi ô, dùng `<br>` khi cần
tách nhiều nguồn hoặc bước xử lý; giữ đường dẫn, symbol và lệnh nguyên vẹn.
Escape dấu `|` thuộc nội dung ô thành `\|`, kể cả trong inline code, để không
phát sinh cột. Quy tắc escape này chỉ áp dụng cho bảng Markdown, không đổi
giá trị trong frontmatter. Đặt dòng trống trước/sau mỗi bảng.

### Mẫu Markdown

````markdown
---
schema: pirl-review/v1
content_language: vi
plan_file: "<đường dẫn Plan tương đối>"
task_id: T01
review_round: 1
prior_review: null
review_roles: [code-analyst, code-reviewer, business-analyst, solution-architect]
repair_roles: []
business_verdict: PASS
verdict: PASS
status: completed
reviewed_at: "<ISO-8601 với +07:00>"
implementation_target: "<diff/commit/đường dẫn đã review>"
---

# Review <NN>: <Task ID> — <Tên công việc>

## Business

### Quality gates

| QG | Kết quả | Bằng chứng |
| --- | --- | --- |
| QG-01 | <PASS / FAIL / BLOCKED> | <source/symbol, logic và kết quả đối chiếu> |

### Findings

#### FIND-01

| Trường | Nội dung |
| --- | --- |
| QG | QG-01 |
| Tác động | <trigger thực tế và hậu quả> |
| Nguồn | <file/symbol hoặc hợp đồng đáng tin> |
| Nguyên nhân | <cơ chế sai> |
| Phản biện | <căn cứ bác bỏ lời giải thích cạnh tranh> |
| Vai trò | <vai-trò, ...> |
| Đích | `<file cần xử lý>` |
| Chỉ dẫn | <việc cụ thể của từng vai trò theo thứ tự> |
| Disposition | <repair / replan> |

### Risks

#### RISK-01

| Trường | Nội dung |
| --- | --- |
| QG | QG-02 |
| Tác động | <phơi nhiễm thực tế và giới hạn> |
| Nguồn | <file/symbol> |
| Nguyên nhân | <cơ chế tạo rủi ro> |
| Phản biện | <vì sao rủi ro còn đứng vững nhưng QG vẫn đạt> |
| Vai trò | <vai-trò, ...> |
| Đích | `<file liên quan>` |
| Chỉ dẫn | <cách giảm thiểu khi được giao> |
| Xem lại khi | <điều kiện cụ thể> |

### Blockers

#### BLOCK-01

| Trường | Nội dung |
| --- | --- |
| QG | QG-03 |
| Thiếu | <đầu vào bắt buộc chưa có> |
| Nguồn | <bằng chứng về việc thiếu> |
| Nguyên nhân | <cơ chế chặn việc kết luận> |
| Owner | <vai trò hoặc chủ cung cấp đầu vào> |
| Đích | `<file liên quan>` |
| Chỉ dẫn | <hành động gỡ chặn> |
| Disposition | <retry / escalate> |
| Điều kiện | <thay đổi cần có trước khi tiếp tục> |

### Tiếp theo

| Trường | Nội dung |
| --- | --- |
| Tiếp theo | <chủ xử lý/layer, file đầu vào và điều kiện tiếp tục> |

## Evaluations

### EVAL-01

| Trường | Nội dung |
| --- | --- |
| Vai trò | <vai trò triển khai hoặc kiểm chứng của Implement> |
| Kết quả | <PASS / FAIL / BLOCKED> |
| Lỗi | <quyết định sai có căn cứ của vai trò; hoặc không có> |
| Nguyên nhân | <instruction / ineffective_fix / input / execution kèm `issue_key`; hoặc không có> |
| Cải tiến | <file và mục đã sửa, version cũ → mới; hoặc chờ người dùng (mode_self / safety); hoặc không cần> |
| Bằng chứng | <Implementation Record, record Implement, nguồn/diff đã đối chiếu> |
````

Thay placeholder bằng nội dung thực tế, chọn một giá trị cho mỗi trạng thái
hoặc disposition. Mỗi QG có đúng một hàng trong bảng Quality gates. Chỉ ghi
FIND/RISK/BLOCK thực sự có; nhóm không có mục nào dùng một câu ngắn dưới
tiêu đề, không tạo bảng rỗng hay ID giả. Đánh số mỗi loại liên tục, giữ thứ
tự findings, risks rồi blockers. EVAL bao phủ đội Implement đã chốt theo
đúng thứ tự Implementation Record; không thêm inventory hoặc mục cấp hai
thứ ba lặp bàn giao.

## Kết thúc và quyền tiếp theo

Chạy validator report và sửa lỗi cấu trúc trước phản hồi cuối:

```powershell
python -B .agents/llm-docs/evals/validate_layer_artifact.py --kind review --path <file report>
```

Người điều phối và mọi vai trò Review thực hiện
[dọn tài nguyên tạm](layered-task-execution.instructions.md#dọn-tài-nguyên-tạm-trước-bàn-giao)
sau lần kiểm chứng, tự đánh giá và ghi record cuối, rồi kiểm lại trước phản
hồi cuối. Quy tắc áp dụng cả khi Business FAIL hoặc Review bị chặn; không nhận
đã hoàn tất chỉ vì report và validator đã đạt.

`verdict` bằng `business_verdict`. `status: completed` nghĩa là đã hoàn tất
đánh giá: Business có kết luận đủ căn cứ, Evaluations bao phủ đội Implement,
record Review đã ghi, và đã dọn, kiểm lại tài nguyên tạm theo hợp đồng chung.
Business FAIL vẫn có thể là một Review hoàn tất. Thiếu đầu vào cần để đánh giá dùng `status: blocked`.

Thiếu Implementation Record hoặc đầu vào của lượt triển khai thì giữ bản nháp
hai phần với đúng đầu vào còn thiếu. Bản nháp chưa đủ hợp đồng không được dùng
làm nguồn giao sửa sản phẩm. Bổ sung ngay trên bản nháp khi có đầu vào, không
mở một vòng chỉ để điền thông tin thiếu.

Báo rõ Business, mức hoàn tất đánh giá, kết quả tự cải tiến theo mục báo cáo
của router và liên kết report/Plan. Kết thúc tại bàn giao; không tự Implement sản phẩm,
chọn task kế tiếp hay mở vòng Review mới.
