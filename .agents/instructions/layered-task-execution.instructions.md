---
name: "Layered Task Execution Instructions"
description: "Định tuyến Plan, Implement, Review, quy định ranh giới giữa các layer và các hợp đồng chung: kiểm chứng bằng lập luận, kiểm chứng layout, tự đánh giá và cải tiến, dọn tài nguyên tạm."
applyTo: ".repos/**/*,.agents/instructions/**/*,.agents/plan/**/*,.agents/review/**/*"
metadata:
  id: ".agents/instructions/layered-task-execution"
  kind: "instruction"
  version: "1.1.1"
  status: "active"
---

# Layered Task Execution Instructions

## Phạm vi và nguồn quyết định

Hợp đồng này định tuyến công việc qua ba layer Plan, Implement, Review và giữ
các quy tắc dùng chung của chúng. Yêu cầu hiện tại và quyền người dùng đã cấp
quyết định phạm vi; vai trò AI Agent cung cấp chuyên môn, không tự bổ sung mục
tiêu sản phẩm hay một vòng phê duyệt mới.

[AGENTS.md](../../AGENTS.md) sở hữu cấu trúc, danh mục vai trò và định tuyến
repo; file vai trò sở hữu chuyên môn của vai trò; router sở hữu cách chọn layer
và hợp đồng chung; hợp đồng layer sở hữu trình tự, trách nhiệm vai trò tại layer
và đầu ra.
Sửa ở nơi sở hữu quyết định, không sao chép quy trình vào nhiều file.

Schema bàn giao hiện hành là `pirl-plan/v1` và `pirl-review/v1`. Schema khác
không là đầu vào bàn giao; không tự tạo migration hoặc reader cho schema cũ.

## Chọn layer

1. Suy mục tiêu từ lời người dùng và ngữ cảnh đã rõ, không từ từ khóa. Khi
   người dùng chỉ định vai trò, giữ danh sách và thứ tự; không hỏi lại phần đã có.
2. Khảo sát nguồn để giải quyết thông tin có thể tìm được. Chỉ hỏi quyết định
   còn thiếu làm khác kết quả, phạm vi hoặc quyền thực hiện; dừng phần phụ
   thuộc quyết định đó, tiếp tục phần độc lập đã đủ căn cứ.
3. Nếu chỉ được hỏi giải thích hoặc khảo sát, trả kết luận đúng phạm vi; không
   tự biến câu hỏi thành gói bàn giao. Khi yêu cầu là delivery sản phẩm, chọn
   đúng layer dưới đây; không tự chuyển layer chỉ vì đã xong phần hiện tại.

Không cần slash command, activation token hoặc từ khóa chính xác.
“Lập Plan cho yêu cầu này” là layer Plan; “Triển khai Plan T01” là layer
Implement; “Review phần triển khai của Plan T01” là layer Review.

| Layer | Kết quả và hợp đồng sở hữu |
| --- | --- |
| Plan | Soạn/chỉnh Plan từ yêu cầu và source; [hợp đồng Plan](plan.instructions.md). |
| Implement | Thực hiện một Plan được chọn, hoặc sửa theo report cùng task; [hợp đồng Implement](implement.instructions.md). |
| Review | Đối chiếu lượt triển khai với Plan; [hợp đồng Review](review.instructions.md). |
| Task độc lập | Việc giao thẳng, ngoài chuỗi của một Plan; [mục Task độc lập](#task-độc-lập). |
| Bảo trì framework | Sửa chính `AGENTS.md`, instruction, rule hoặc công cụ của framework; [mục Bảo trì framework](#bảo-trì-framework). |

Chỉ nạp tài liệu liên quan tới quyết định hiện tại: hợp đồng của layer được
chọn, ngữ cảnh và rule của repo đích. Không nạp mọi file trong `.agents/`.

## Task độc lập

Task độc lập là việc người dùng giao thẳng và khép trong chính lượt đó, không
nằm trong chuỗi Plan → Implement → Review: soạn hoặc cập nhật tài liệu theo
yêu cầu, khảo sát có đầu ra bền vững, sửa nhỏ do người dùng chỉ định. Thực hiện
một task của Plan vẫn là Implement dù chỉ có một vai trò. Câu hỏi chỉ cần giải
thích, không tạo đầu ra bền vững, được trả lời trực tiếp (bước 3 mục Chọn layer).

Không có Review nào được lên lịch, nên người thực hiện tự khép vòng ngay trong phiên:

1. Hoàn tất delivery trong đúng phạm vi người dùng giao, theo quy tắc lõi.
2. Tự kiểm chứng: đối chiếu đầu ra với yêu cầu và nguồn có thẩm quyền, chọn
   phản ví dụ có khả năng bác bỏ khẳng định quan trọng nhất; sửa đầu ra sai
   trước khi báo cáo. Ghi đó là tự kiểm chứng, không phải review độc lập.
3. Báo riêng kết quả delivery, cách đã kiểm chứng và phần chưa biết. Không tạo
   Plan hoặc report khi người dùng không yêu cầu. Task độc lập không ghi record
   tự đánh giá; chỉ ba layer ghi theo [mục Tự đánh giá và cải tiến](#tự-đánh-giá-và-cải-tiến).
4. Dọn tài nguyên tạm theo [mục dọn tài nguyên](#dọn-tài-nguyên-tạm-trước-bàn-giao).

Nếu người dùng sau đó yêu cầu Review, Review đánh giá như thường; tự kiểm
chứng không thay kết luận của Review.

## Bảo trì framework

Yêu cầu sửa trực tiếp `AGENTS.md`, instruction, rule, `.repos/manifest.yaml` hoặc
công cụ trong `.agents/llm-docs/evals/` và `.tools/` là bảo trì framework theo
phạm vi người dùng giao. Không ép tạo Plan hay report sản phẩm trước khi sửa.
Cải tiến do `process-auditor` áp dụng trong một lượt layer theo
[mục Tự đánh giá và cải tiến](#tự-đánh-giá-và-cải-tiến) cũng là bảo trì framework,
được chính mục đó cho phép mà không cần yêu cầu riêng.

- Bắt đầu từ quyết định sai hoặc thiếu, rồi xác định file sở hữu: `AGENTS.md`
  cho cấu trúc, vai trò và định tuyến; router cho ranh giới layer và hợp đồng
  chung; layer cho trình tự và đầu ra; rule cho ràng buộc dùng lại. Đọc các
  file tham chiếu tới quy tắc trước khi thay, để file khác không khôi phục
  hành vi cũ.
- Sửa bằng điều kiện và hành động đủ cụ thể; thay đoạn sai thay vì chồng thêm
  lời nhắc. Đọc lại bằng tình huống gây lỗi và một tình huống gần giống mà quy
  tắc không được áp dụng. Không thêm test, validator hay schema để thay cho
  cải thiện nội dung.
- Sau khi sửa, chạy lệnh kiểm tra tương ứng ở mục
  [Kiểm tra framework](../../AGENTS.md#kiểm-tra-framework) của `AGENTS.md`.
  Kiểm tra chỉ xác nhận cấu trúc, không chứng minh chất lượng câu chữ.

## Runtime Neutrality

Framework không chọn hoặc yêu cầu provider, model, reasoning effort hay host.
Không suy từ công cụ thiếu hoặc test bị skip ra yêu cầu cài runtime hay hỗ trợ
hệ điều hành mới. Chỉ điều kiện cần cho kết quả đã được giao mới có thể chặn
phần đó. Một vai trò không cần agent riêng để được thực hiện; xem
[nguyên tắc giao việc](../../AGENTS.md#vai-trò-ai-agent).

## Kiểm chứng bằng lập luận

Quy tắc này áp dụng cho chuỗi Plan → Implement → Review của việc phát triển.
Công việc trong chuỗi gồm triển khai source code sản phẩm (cùng tài liệu đi
kèm trong repo đích), tạo mới/cập nhật tài liệu ngữ cảnh của repo, và viết,
cập nhật, chạy test chức năng theo
[quy tắc FUT](../llm-docs/rules/test-verification.rule.md#quy-tắc-fut-test-chức-năng)
khi REQ/đặc tả cần. Build, chạy ứng dụng/database/trình duyệt để nghiệm thu,
đo hiệu năng hoặc tải, chạy test ngoài phạm vi FUT, dựng harness hay script
kiểm chứng mới, deploy và release thuộc giai đoạn build/test/release của người
dùng, nằm ngoài vòng đời task: giai đoạn đó không tạo evidence cho framework
và không bàn giao kết quả lại cho task. Lỗi người dùng thấy ở đó được gửi
thành yêu cầu sửa độc lập, là task mới. Ngoại lệ duy nhất là
[kiểm chứng layout bằng mock](#kiểm-chứng-layout-bằng-mock) trong lượt Implement.

Kiểm chứng kết quả triển khai là lập luận của agent: đọc diff và source, lần
đường chạy từ entrypoint qua caller, guard, thao tác ghi/đọc tới trạng thái
cuối, đối chiếu từng `Logic bắt buộc` của QG, chọn phản ví dụ hoặc nhánh lỗi có
thể bác bỏ, phản biện giải thích cạnh tranh rồi kết luận `PASS|FAIL|BLOCKED` có
nguồn. Đọc file, diff, lịch sử git hay tìm kiếm là thu nguồn cho lập luận,
không phải phép chạy kiểm chứng. Kết quả test/build/chạy, dù có sẵn trong
repository, CI, report cũ hay từ lần chạy test theo FUT, không là baseline hay
bằng chứng PASS/FAIL của QG: test đỏ phải được giải thích bằng source, test
xanh chỉ chứng minh case đã chạy.

- Plan không tạo task, bước, REQ, QG hay đường dẫn được phép sửa cho việc của
  giai đoạn người dùng; test chỉ được giao theo FUT. Nếu đặc tả có mục tiêu
  thuộc giai đoạn đó, ghi một dòng rằng nó thuộc giai đoạn build/test/release
  của người dùng.
- Implement không build, không chạy ứng dụng để nghiệm thu; chỉ viết, cập nhật
  và chạy test theo FUT, và khi diff đổi giao diện thì kiểm chứng layout bằng
  mock theo mục dưới. Không ghi việc của giai đoạn người dùng là
  `BLOCKED` hay rủi ro còn lại của task; chỉ liệt kê ngắn những gì chuyển sang
  giai đoạn đó.
- Review không build, không tạo hay chạy test hay mock; không mở FIND/RISK/BLOCK
  vì thiếu test, chưa build/chạy hay vì test đỏ/xanh. Mỗi kết luận được chứng
  minh hoặc bác bỏ bằng lập luận trên source; test trong diff vi phạm FUT là
  lỗi phải sửa theo hợp đồng Review. Riêng diff đổi giao diện, Review đọc ảnh
  và tóm tắt kiểm chứng layout của Implement theo mục dưới.
- Không layer nào yêu cầu người dùng cung cấp kết quả build/test/release, số
  đo, ảnh chụp hay dữ kiện vận hành để task được `implemented`, PASS hoặc đóng.
  Không đặt chúng vào `Authorization condition`, `Next allowed owner/layer`,
  checkpoint chờ xác nhận, `awaiting_confirmation` hay danh sách việc còn mở
  của task; không giữ task hoặc report ở trạng thái chờ chúng. Task kết thúc
  khi QG của chính nó đã được kết luận bằng lập luận. Ảnh layout do chính lượt
  Implement tạo theo mục dưới không phải dữ kiện người dùng cung cấp.

Lệnh do người dùng yêu cầu được chạy trong mọi layer: khi người dùng yêu cầu
rõ một lệnh hay phép kiểm tra, chạy đúng phần được yêu cầu trong lượt đó và
báo kết quả riêng; kết quả không thay lập luận QG và không mở rộng sang lệnh
khác. Yêu cầu điều tra nguyên nhân gốc rễ của một bug/issue cho phép vai trò
chịu trách nhiệm điều tra tái hiện lỗi trong lượt đó: chạy lệnh, test liên
quan, ứng dụng hoặc dữ liệu thử nhỏ tại ranh giới gây lỗi để phân biệt các giả
thuyết. Dừng khi nguyên nhân đã được phân biệt; kết quả tái hiện là bằng chứng
chẩn đoán, không là baseline QG và không kéo theo việc chạy cả hệ thống.

Lệnh validator Plan/report, lệnh `layer_record.py`, lệnh kiểm tra framework sau
tự cải tiến và rà `git status` khi dọn tài nguyên là thủ tục bàn giao theo hợp
đồng, vẫn chạy như quy định và không là phép kiểm chứng sản phẩm. Chỉ dẫn chạy, đo hay tái hiện trong tài liệu của repo chỉ dùng khi người
dùng giao trực tiếp việc đó (kể cả task độc lập) hoặc yêu cầu điều tra nguyên
nhân gốc rễ; chỉ dẫn viết/chạy test dùng trong giới hạn FUT; chỉ dẫn chụp
layout dùng theo mục kiểm chứng layout bằng mock; ngoài các trường hợp đó,
áp dụng cùng cơ chế bằng lập luận trên source.

### Kiểm chứng layout bằng mock

Trong lượt Implement của chuỗi Plan (lượt đầu và lượt sửa), khi diff tạo mới
hoặc đổi phần người dùng nhìn thấy, `frontend-developer` (hoặc người điều phối
khi tự thực hiện vai trò này) dựng mock và chụp layout sau khi triển khai, trước khi
vai trò kiểm chứng kết luận QG. Task độc lập và việc làm trực tiếp ngoài Plan
chỉ làm khi người dùng yêu cầu.

- **Khi nào:** diff đổi markup/template/component hiển thị, style (CSS/SCSS,
  token dùng cho bố cục), thêm màn hình, hộp thoại, popup, hoặc đổi trạng
  thái hiển thị (lỗi, rỗng, đang tải, bị khóa) hay chuỗi giao diện có thể làm
  đổi bố cục. Không áp dụng khi diff chỉ ở backend, domain thuần không đổi
  hiển thị, test hoặc tài liệu.
- **Làm gì:** chạy frontend ở chế độ phát triển và trả mọi lời gọi API bằng
  mock ngay trong trình duyệt; không backend, database, build hay typecheck.
  Dẫn tới từng trạng thái mà diff tạo hoặc đổi, gồm nhánh lỗi và lỗi kiểm tra
  ô nhập, rồi chụp mỗi trạng thái theo mọi ngôn ngữ giao diện, ở khổ máy tính
  và khổ điện thoại mà tài liệu ngữ cảnh của repo (`context_docs` trong
  `.repos/manifest.yaml`) quy định. Tài liệu chưa quy định thì lấy ngôn ngữ từ
  cấu hình i18n và khổ màn hình từ breakpoint CSS của repo, và ghi rõ bộ
  khổ/ngôn ngữ đã dùng. Kiểm thêm điều ảnh không cho thấy: văn bản đúng ngôn
  ngữ, thành phần nằm trong khung nhìn, không cuộn ngang, focus và phím Esc
  khi hộp chồng lên nhau, trang cuộn được sau khi đóng. Cách này dành cho giao
  diện web phục vụ qua dev server; giao diện khác (extension, ứng dụng native)
  thì phần layout `BLOCKED` kèm chủ xử lý, không tự chế phương tiện. Công cụ
  và đường dẫn runtime thuộc ghi chú của repo, không thuộc framework.
- **Lưu ở đâu:** script mock, ảnh và bảng kết quả trong
  `.tmp/layout-snapshots/<plan-set>/<task-id>/<YYYYMMDD-HHmmss>/` ở gốc Hub
  (bị Git ignore). Mỗi lần chạy một thư mục mới; không xóa hay ghi đè lần
  chạy trước. Thư mục này là đầu ra bàn giao được giữ lại; máy chủ phát
  triển, trình duyệt và profile tạm vẫn dừng hoặc xóa theo mục dọn tài nguyên.
- **Vai trò bằng chứng:** ảnh và kết quả kiểm là bằng chứng bắt buộc cho phần
  layout, đi cùng chứ không thay lập luận QG trên source. Phép chạy này không
  mở rộng sang build, typecheck, test ngoài FUT, backend thật, thiết bị thật
  hay phát hành; các việc đó vẫn thuộc giai đoạn người dùng. Vai trò kiểm
  chứng xem ảnh như nguồn khi kết luận QG về giao diện, không tự chạy. Mỗi kiểm
  không đạt được so với cùng kịch bản ở trạng thái chưa có diff (màn hình hay
  route không bị đổi); chỉ lỗi do diff gây ra mới là FAIL. Layout sai do diff
  (tràn, che, sai ngôn ngữ, thiếu trạng thái) là FAIL trả `frontend-developer`,
  cùng giới hạn hai lần sửa của Implement; lỗi có từ trước ghi vào nơi dự án
  lưu khoảng trống đã biết và vào tóm tắt, không chặn task. Không có engine
  trình duyệt dùng được thì phần layout `BLOCKED` kèm chủ xử lý. Diff đổi giao
  diện chưa có kết quả này thì task chưa được ghi `implemented`.
- **Ghi lại:** tóm tắt trong trường `layout_verification` của Implementation
  Record: trạng thái đã chụp, ngôn ngữ, khổ màn hình, số ảnh, kiểm đạt/không
  đạt và đường dẫn thư mục. `.tmp/` không đi theo commit nên tóm tắt là bằng
  chứng, đường dẫn chỉ để tra cứu.
- **Review:** đọc tóm tắt và ảnh của Implement, không tự chạy lại. Diff đổi
  giao diện mà Record thiếu kết quả này, hoặc ảnh cho thấy layout vi phạm QG,
  là FIND `repair` cho `frontend-developer`.

## Tự đánh giá và cải tiến

Mỗi lượt Plan, Implement hoặc Review (kể cả lượt sửa và mỗi vòng Review) tự
đánh giá và cải tiến framework trước khi bàn giao, dù kết quả là PASS, FAIL hay
bị chặn. Task độc lập và bảo trì framework không áp dụng mục này.

### Thời điểm và người đánh giá

- Đầu lượt, người điều phối chạy
  `python -B .agents/llm-docs/evals/layer_record.py start` và giữ `framework_ref`
  trả về: commit của Hub và mã băm của các file framework đang khác commit đó.
  Đây là phiên bản quy tắc lượt này áp dụng.
- Sau khi đầu ra của layer đã chốt và trước khi dọn tài nguyên,
  [`process-auditor`](../roles/process-auditor.role.md) đánh giá lượt chạy:
  mọi vai trò đã tham gia và chính người điều phối (chọn đội, giao việc, hợp
  nhất kết quả). Ở Review, `process-auditor` còn đánh giá lại các vai trò của
  lượt Implement được review theo
  [mục Evaluations](review.instructions.md#evaluations-đánh-giá-vai-trò-implement).
- Giao `process-auditor` cho agent riêng khi host cho phép và ghi `mode: agent`.
  Không giao được thì người điều phối tự đánh giá và ghi `mode: self`.

### Lỗi và nguyên nhân

Lỗi là một quyết định hoặc đầu ra sai so với yêu cầu, source, hợp đồng hoặc quy
tắc, có bằng chứng. Mỗi lỗi ghi vai trò (hoặc `coordinator`), quyết định sai,
quy tắc liên quan dạng `file#mục`, bằng chứng và `issue_key`: khóa kebab-case
mô tả lỗi; lỗi đã có trong record cũ giữ nguyên khóa cũ.

Trước khi phân loại, tra record cũ bằng `layer_record.py query --issue-key <khóa>`
và `layer_record.py query --rule <file#mục>`. Phân loại theo bằng chứng, không
theo số lần lặp:

| Nguyên nhân | Khi nào | Cải tiến bắt buộc |
| --- | --- | --- |
| `instruction` | Đọc quy tắc ở đúng `framework_ref`: không quy tắc nào bao trường hợp này, quy tắc dẫn tới quyết định sai, hai quy tắc mâu thuẫn, hoặc quy tắc mơ hồ | Sửa quy tắc |
| `ineffective_fix` | Record cũ đã sửa lỗi cùng khóa hoặc cùng quy tắc, mà lỗi vẫn xảy ra | Xác định vì sao lần sửa đó thất bại (sai nguyên nhân, không bao trường hợp này, vai trò không nạp tới quy tắc), rồi thay hoặc hoàn tác chính lần sửa đó, không chồng thêm. Ghi `prior_fix` |
| `input` | Quy tắc đúng nhưng đầu vào thiếu hoặc sai: Plan thiếu quyết định, tài liệu ngữ cảnh thiếu, manifest sai | Sửa nơi tạo ra đầu vào: quy tắc của layer tạo đầu vào đó, `context_docs`, manifest |
| `execution` | Quy tắc rõ, đã được nạp và dẫn tới quyết định đúng, nhưng vai trò không làm theo | Tăng cưỡng chế: đưa điểm đó vào cột "Hoàn tất khi" của vai trò trong bảng của file layer, hoặc giao vai trò kiểm chứng kiểm đúng điểm đó |

Lỗi đầu ra (source sản phẩm, Plan, report) còn được trả về vai trò sở hữu để
sửa trong lượt, theo hợp đồng và giới hạn của layer (ví dụ giới hạn hai lần sửa
của Implement). `process-auditor` chỉ sửa file framework.

### Cải tiến triệt để khi `mode: agent`

Mỗi lỗi phải có cải tiến được áp dụng ngay trong lượt. Không có vùng cấm và
không chờ đề xuất:

1. Sửa mọi nơi sở hữu nguyên nhân: file layer, file vai trò, `AGENTS.md`,
   router, rule, công cụ framework cùng test của nó, `context_docs`, manifest.
2. Quét toàn framework tìm chỗ còn mô tả hành vi cũ và sửa trong cùng lượt.
3. Thay đoạn sai bằng điều kiện và hành động cụ thể, không chồng thêm lời nhắc.
4. Tăng `version` của file có version.
5. Đọc lại phần đã sửa với tình huống gây lỗi và một tình huống gần giống mà quy
   tắc mới không được áp dụng.
6. Chạy các lệnh ở [Kiểm tra framework](../../AGENTS.md#kiểm-tra-framework)
   tương ứng với phần đã sửa.

Ngoại lệ bắt buộc: không làm lỏng
[quy tắc an toàn](../llm-docs/rules/core-agent.rule.md#safety-rules-and-self-improvement).
Cải tiến cần làm lỏng quy tắc an toàn không được áp dụng: ghi `pending_user`
với lý do `safety` và hỏi người dùng.

### Tự đánh giá khi `mode: self`

Không sửa file framework. Mọi cải tiến ghi `pending_user` với lý do `mode_self`.
Phản hồi cuối có mục "Tự đánh giá cần bạn quyết định": mỗi mục nêu lỗi, nguyên
nhân, quy tắc, thay đổi cụ thể sẽ áp dụng và bằng chứng. Người dùng chọn áp
dụng, bỏ qua, hoặc đánh giá lại bằng agent riêng. Lượt thực hiện lựa chọn đó ghi
record mới có `supersedes` trỏ tới record cũ.

### Record

Mỗi lượt ghi đúng một record bằng
`python -B .agents/llm-docs/evals/layer_record.py append --input <file JSON>`
(hoặc truyền JSON qua stdin). Trên Windows, dùng `--input` với file UTF-8 để
không hỏng tiếng Việt. Công cụ thêm `schema`, `record_id`, `recorded_at` và từ
chối record sai cấu trúc; record bị từ chối thì lượt chưa hoàn tất. Không sửa
tay file JSONL; đính chính bằng record mới có `supersedes`. Record là đầu ra bàn
giao, nằm ở `.agents/records/<layer>/<YYYY-MM-DD>.jsonl`.

| Trường | Nội dung |
| --- | --- |
| `layer` | `plan`, `implement` hoặc `review` |
| `framework_ref` | Giá trị `start` trả về lúc đầu lượt |
| `task` | `plan_set`, `task_ids`; Review thêm `report_file` |
| `target_repo` | Như trong Plan |
| `outcome` | `status` (Plan: `ready`, `draft`, `blocked`; Implement: trạng thái của Implementation Record; Review: `completed`, `blocked`) và `summary`; Review thêm `verdict` |
| `roles` | Mỗi vai trò tham gia: `role`, `mode`, `assignment`, `result` (`PASS`, `FAIL`, `BLOCKED`) |
| `audit` | `role: process-auditor`, `mode`, `result` (`clean` hoặc `issues`) |
| `issues` | Mỗi lỗi: `id` (`ISSUE-NN`), `issue_key`, `role`, `record` (null; hoặc record trong `evaluates` khi lỗi thuộc lượt được đánh giá lại), `cause`, `decision`, `rule`, `evidence`, `prior_fix` (`<record_id>#FIX-NN`, chỉ với `ineffective_fix`) |
| `fixes` | Mỗi cải tiến: `id` (`FIX-NN`), `issues` mà nó xử lý, `status` (`applied` hoặc `pending_user`), `reason` khi chờ (`mode_self` hoặc `safety`), `files` (`path`, `section`), `summary`, `checks` (lệnh kiểm tra đã chạy, bắt buộc khi `applied`) |
| `evaluates` | Review: record của lượt Implement được review; layer khác ghi null |
| `supersedes` | Record được đính chính, hoặc null |

Mỗi lỗi phải nằm trong ít nhất một cải tiến.

### Báo cáo

Phản hồi cuối của lượt có mục "Tự cải tiến": `record_id`, rồi với mỗi cải tiến
đã áp dụng nêu lỗi, nguyên nhân, file và mục đã sửa, version cũ → mới, tóm tắt
thay đổi; hoặc một câu "không phát hiện lỗi". Cải tiến chờ người dùng đi trong
mục "Tự đánh giá cần bạn quyết định".

## Dọn tài nguyên tạm trước bàn giao

Quy tắc này áp dụng cho mọi layer Plan, Implement, Review, task độc lập và
bảo trì framework. Nó không đổi cách định tuyến nhiệm vụ. Vai trò/agent tạo
tài nguyên tạm phải tự dọn; người điều phối chịu trách nhiệm kiểm tra toàn
lượt, kể cả phần giao agent phụ. Không đẩy việc dọn sang layer sau hoặc chờ
người dùng nhắc. PASS, FAIL, bị chặn hay bị hủy đều phải dọn phần không còn
cần trước khi bàn giao kết quả tương ứng.

- Phạm vi bắt buộc dọn là vùng Git có thể commit của Hub và các submodule
  trong `.repos/`: file đã được theo dõi và file untracked không bị
  `.gitignore` loại trừ. Đường dẫn bị Git ignore (ví dụ `.tmp/` ở gốc Hub,
  `node_modules/`, thư mục build) và vị trí ngoài repo không được commit nên
  không thuộc nghĩa vụ dọn; có thể giữ lại cho lượt sau. Thư mục
  `.tmp/layout-snapshots/` của [kiểm chứng layout bằng mock](#kiểm-chứng-layout-bằng-mock)
  là đầu ra bàn giao, luôn giữ lại.
- Khi tạo file, thư mục hoặc phiên tạm trong vùng có thể commit, giữ đường
  dẫn/owner trong ngữ cảnh làm việc; không tạo thêm manifest hay log dọn rác
  chỉ để theo dõi. Chạy công cụ Python bằng `python -B` để tránh `__pycache__`.
- Trong vùng đó, xóa ngay khi hết mục đích sử dụng: script probe, bản nháp
  đầu vào, ảnh, trace, log, cache và thư mục tạm riêng của lượt. Ở mọi
  nơi, đóng browser/tiến trình tạm do lượt khởi tạo khi không còn cần; không
  dừng phiên dùng chung có sẵn hoặc dịch vụ đang là đầu ra người dùng cần
  tiếp tục sử dụng.
- Trước khi xóa raw evidence, lưu trigger, cách tái hiện, runtime, số đo và
  kết luận cần thiết vào đầu ra chính thức theo hợp đồng đang áp dụng. Giữ
  source, đầu vào của người dùng, Plan, report và record trong
  `.agents/records/`. Chỉ giữ raw file khi người dùng yêu cầu hoặc nó là đầu ra
  bàn giao đã xác định; không viện cớ có thể dùng lại để giữ rác. Không để tham
  chiếu cần thiết trỏ vào file tạm sắp xóa, đường dẫn bị Git ignore hoặc vị trí
  ngoài repo, vì chúng không đi theo commit.
- Xác minh quyền sở hữu và đường dẫn tuyệt đối trước khi xóa, dùng đích cụ
  thể. Không xóa cả TEMP, dùng `git clean` rộng, hay coi mọi file untracked
  là rác. Với tài nguyên chưa rõ owner, xác minh trước; không xóa nhầm để
  đạt trạng thái sạch. Agent phụ dọn phần mình và báo chính xác phần còn lại
  nếu gặp lỗi thật; người điều phối tiếp nhận và xử lý trong cùng lượt.
- Sau lệnh kiểm chứng cuối có thể sinh lại file, rà `git status --short` của
  Hub và từng submodule đã dùng: mọi thay đổi hoặc file untracked còn lại phải
  là đầu ra bàn giao hoặc thay đổi sẵn có của người dùng. Chỉ nhận hoàn tất
  sau khi đã dọn và kiểm lại. Nếu file bị khóa hoặc thiếu quyền thật, dọn
  phần còn làm được, báo đường dẫn, nguyên nhân, chủ xử lý và bước gỡ; giữ
  nghĩa vụ dọn mở và báo riêng kết quả sản phẩm, không bịa đã sạch hay đổi QG.

## Kết thúc và xác nhận

Kết thúc sau delivery và dọn tài nguyên tạm theo hợp đồng chung ở trên; báo
riêng kết quả, bằng chứng và phần còn thiếu của mỗi phần. Giữ quyền đã có,
không hỏi lại xác nhận thường lệ. Việc tiếp theo thuộc task/layer khác cần chỉ
thị tương ứng; không tự bắt đầu chỉ vì report có đề xuất.
