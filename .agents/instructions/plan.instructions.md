---
name: "Hướng dẫn layer Plan"
description: "Tạo Plan ngắn bằng tiếng Việt, chốt logic nghiệp vụ, giao vai trò triển khai và vai trò kiểm chứng bằng lập luận."
applyTo: ".agents/instructions/plan.instructions.md"
metadata:
  id: ".agents/instructions/plan"
  kind: "instruction"
  version: "1.5.0"
  status: "active"
---

# Hướng dẫn layer Plan

Chỉ áp dụng quy trình Plan khi yêu cầu và [router](layered-task-execution.instructions.md)
đã chọn layer này. Đọc hoặc cập nhật một file Plan/report không tự kích hoạt
layer khác.

Plan chốt việc cần làm, cách làm, vai trò triển khai, vai trò kiểm chứng và
logic phải đúng. Viết bằng tiếng Việt; giữ nguyên ID, khóa dữ liệu, symbol,
lệnh và đường dẫn khi tham chiếu. Đầu ra ngắn nhưng bên triển khai không phải
tự quyết lại hành vi sản phẩm.

## Vai trò AI Agent tại layer Plan

Danh mục vai trò và nguyên tắc giao việc nằm ở [AGENTS.md](../../AGENTS.md#vai-trò-ai-agent);
chuyên môn của từng vai trò nằm trong file vai trò được liên kết trong bảng.
Plan chọn đội nhỏ nhất đủ chuyên môn cho yêu cầu theo cột "Chọn khi" và ghi vào
`planning_roles`. Người dùng chỉ định vai trò thì giữ đúng danh sách đó. Không
gọi thêm vai trò chỉ để đủ quy trình.

| Vai trò | Chọn khi | Trách nhiệm tại Plan | Đầu vào | Hoàn tất khi |
| --- | --- | --- | --- | --- |
| [`business-analyst`](../roles/business-analyst.role.md) | Yêu cầu có hành vi nghiệp vụ cần chốt | Chốt REQ, logic nghiệp vụ và QG; tìm quyết định sản phẩm còn thiếu | Yêu cầu, quyết định đã có, đặc tả | Mỗi REQ có nguồn và kết quả; nguồn chỉ ghi là quyết định của người dùng phần có trong lời người dùng hoặc trong nguyên văn lựa chọn và mô tả lựa chọn mà người dùng đã thấy khi chọn; phần suy ra từ source hoặc quy ước repo, phần diễn giải hay mở rộng một lựa chọn, và phần agent tự chọn trong việc người dùng giao rõ cho agent đều ghi là agent quyết, kèm căn cứ; lựa chọn sản phẩm làm khác kết quả mà chưa ai quyết đã được hỏi hoặc đánh dấu chưa chốt; mỗi QG nêu được logic bắt buộc; căn cứ do vai trò đọc từ nguồn, chỉ chạy hay dựng công cụ đo khi người dùng yêu cầu điều tra nguyên nhân gốc rễ ([Khảo sát và chốt quyết định](#khảo-sát-và-chốt-quyết-định)) |
| [`code-analyst`](../roles/code-analyst.role.md) | Yêu cầu chạm source hoặc tài liệu của repo đích | Đọc caller/consumer, cấu hình và ràng buộc; xác định điểm sửa và tài liệu bị ảnh hưởng | Source của repo đích | Phạm vi sửa và đường dẫn được phép sửa có căn cứ source; với thay đổi lan sang phần tử hay consumer khác (thuộc tính kế thừa, tạo khối chứa hay stacking, cấu hình mặc định), đã nêu phần tử mang thay đổi và danh sách chịu ảnh hưởng; căn cứ do vai trò đọc từ nguồn, chỉ chạy hay dựng công cụ đo khi người dùng yêu cầu điều tra nguyên nhân gốc rễ ([Khảo sát và chốt quyết định](#khảo-sát-và-chốt-quyết-định)) |
| [`solution-architect`](../roles/solution-architect.role.md) | Đổi hợp đồng API/dữ liệu/quyền, hoặc gói có nhiều task | Chốt hợp đồng, ownership, mô hình quyền, ranh giới và phụ thuộc giữa task | Source, hợp đồng dùng chung | Mỗi task có kết quả nghiệm thu riêng; phụ thuộc thật được ghi; với mỗi giá trị, symbol hay file mà một task thêm, đổi hoặc bỏ, mọi đoạn của file dùng chung giữa các task (kể cả tài liệu ngữ cảnh) đang nêu nó nằm trong REQ, `Đường dẫn được phép sửa` và QG của chính task đó, nên file vẫn đúng sau khi từng task hoàn tất; căn cứ do vai trò đọc từ nguồn, chỉ chạy hay dựng công cụ đo khi người dùng yêu cầu điều tra nguyên nhân gốc rễ ([Khảo sát và chốt quyết định](#khảo-sát-và-chốt-quyết-định)) |
| [`ux-designer`](../roles/ux-designer.role.md) | Yêu cầu chạm phần người dùng nhìn thấy | Chốt màn hình, trạng thái hiển thị, luồng thao tác, chuỗi giao diện theo ngôn ngữ và khổ màn hình; viết QG giao diện thành logic trạng thái và bố cục | Yêu cầu, giao diện hiện có, tài liệu ngữ cảnh của repo | Mỗi trạng thái hiển thị được tạo hoặc đổi có QG; căn cứ do vai trò đọc từ nguồn, chỉ chạy hay dựng công cụ đo khi người dùng yêu cầu điều tra nguyên nhân gốc rễ ([Khảo sát và chốt quyết định](#khảo-sát-và-chốt-quyết-định)) |
| [`process-auditor`](../roles/process-auditor.role.md) | Mọi lượt Plan; không ghi vào `planning_roles` | Tự đánh giá lượt Plan theo [router](layered-task-execution.instructions.md#tự-đánh-giá-và-cải-tiến) | Plan, nguồn đã dùng, quyết định của từng vai trò | Record đã ghi; cải tiến đã áp dụng hoặc đã tổng hợp cho người dùng |

Người điều phối Plan hợp nhất kết luận của các vai trò, phân xử bất đồng bằng
nguồn (không bỏ phiếu), viết Plan và tự rà soát. Mỗi vai trò trả quyết định
chuyên môn kèm nguồn làm thay đổi phương án. Mỗi file Plan ghi cách thực hiện
các vai trò lập Plan ở dòng `Lập Plan` của mục `Vai trò tham gia`: agent riêng
hay người điều phối tự thực hiện kèm lý do không giao được, theo từng vai trò
khi khác nhau. Khi tự thực hiện, không tuyên bố đã có phản biện độc lập.

## Khảo sát và chốt quyết định

- Đọc yêu cầu cùng quyết định đã có; xác định repo đích theo
  [định tuyến repo](../../AGENTS.md#định-tuyến-repo) và phần cần đổi từ source.
- Đọc caller/consumer, ràng buộc và cấu hình liên quan trước khi khẳng định
  thiếu cơ chế; không suy toàn hệ thống từ một file hoặc bản review chưa kiểm
  chứng. Vai trò lập Plan khảo sát bằng đọc source, tài liệu, lịch sử git và
  hồ sơ đã có; không dựng trang mô phỏng hay công cụ đo, không chạy ứng dụng
  hay trình duyệt. Đại lượng mà đọc không cho ra thì tính từ source kèm công
  thức, hoặc ghi chưa có số đo. Chỉ khi người dùng yêu cầu điều tra nguyên nhân
  gốc rễ, vai trò chịu trách nhiệm được tái hiện lỗi theo
  [router](layered-task-execution.instructions.md#kiểm-chứng-bằng-lập-luận);
  Plan ghi nguyên nhân đã phân biệt, không ghi kết quả tái hiện thành QG.
- Chốt khác biệt giữa hiện trạng và kết quả cần đạt. Hỏi khi thiếu lựa chọn
  sản phẩm làm khác kết quả; tự giải quyết chi tiết từ source và quy ước repo.
  Nếu chỉ một nhánh bị chặn, hoàn tất phần Plan độc lập và đánh dấu rõ giới hạn.

## Chia task để triển khai và nghiệm thu riêng

- Ưu tiên mỗi file Plan là một phần việc có kết quả và QG kiểm chứng được
  riêng. Chọn ranh giới theo hành vi/hợp đồng có thể hoàn tất, không theo số
  file, layer kỹ thuật hoặc mục tiêu chia càng nhỏ càng tốt. Cùng một lần
  phát hành không phải lý do gộp mọi phần việc vào một task.
- Với mỗi task, xét trạng thái chỉ có source ban đầu, đầu ra của các task
  tiên quyết đã hoàn tất và thay đổi của chính task đó: mọi QG phải chứng
  minh được bằng lập luận trên source của trạng thái này. QG không được cần
  code, cấu hình, sửa lỗi hay bằng chứng chỉ được giao cho task chạy sau hoặc
  task dự kiến làm song song. Không tạo task mà Implement xong vẫn phải chờ
  task sau để Review có thể PASS.
- Giảm phụ thuộc bằng hợp đồng đã chốt và phạm vi sửa rõ ràng. Với API,
  schema hoặc file dùng chung, chỉ rõ phần nào đã có, phần nào cần triển
  khai và task nào sở hữu từng thay đổi. Với tài liệu nhiều task cùng sửa,
  giao theo thay đổi, không theo mục, cột hay chủ đề: với mỗi giá trị, symbol
  hay file mà một task thêm, đổi hoặc bỏ, tìm theo tên token, giá trị, tên
  file mọi đoạn nêu nó, kể cả bảng liệt kê đầy đủ (danh sách component, cây
  thư mục), rồi giao đoạn đó cho chính task đó. Hai task đổi cùng một giá
  trị thì mỗi task cập nhật đoạn đó cho thay đổi của mình. Hợp đồng trên
  giấy không thay cho implementation cần để kết luận QG; hai task sửa cùng
  symbol/quyết định chưa thể coi là độc lập chỉ vì `depends_on: []`.
- Khi có phụ thuộc thật, ghi `depends_on` và đầu ra cụ thể cần nhận trong
  `Làm như thế nào`. Task tiên quyết phải tự đạt QG trước khi task phụ thuộc
  bắt đầu phần cần đầu ra đó. Nếu không thể khép QG riêng, đổi ranh giới,
  đưa phần dùng chung thành task tiên quyết có kết quả kiểm chứng được,
  hoặc gộp đúng các phần không thể tách. Không giấu phụ thuộc bằng mock,
  xóa khai báo, hạ QG hoặc tạo abstraction chỉ để chia task.
- Giao mỗi điều kiện nghiệm thu cho task sở hữu kết quả đó. Tiêu chí toàn
  luồng hoặc gỡ cơ chế cũ chỉ đạt sau khi ghép nhiều phần thuộc task tích
  hợp phụ thuộc các phần đó; không đặt lại tiêu chí này làm điều kiện PASS
  của task tiên quyết. Giữ đủ yêu cầu toàn gói, không đẩy hành vi cốt lõi
  của một task sang tích hợp để task đó được PASS. Lập luận trên một hợp
  đồng cục bộ không chứng minh đường chạy thật hay bất biến dữ liệu; QG loại
  đó phải nêu các điểm ghi/đọc cần lần qua.
- `depends_on` trỏ task có trong cùng gói, không tự phụ thuộc hoặc tạo vòng.
  Đọc lại cả các QG để tìm phụ thuộc ngầm: T02 cần T01 nhưng QG của T01 cần
  T02 vẫn là vòng dù danh sách `depends_on` hợp lệ. Sửa phân công/QG trước
  bàn giao, không để Implement/Review lặp sửa code để giải quyết lỗi chia task.

## Phạm vi việc: source code, tài liệu và test chức năng

Theo [router](layered-task-execution.instructions.md#kiểm-chứng-bằng-lập-luận),
task gồm triển khai source code sản phẩm (cùng tài liệu đi kèm trong repo
đích), tạo mới/cập nhật tài liệu ngữ cảnh của repo (`context_docs` trong
`.repos/manifest.yaml`), và test chức năng theo
[quy tắc FUT](../llm-docs/rules/test-verification.rule.md#quy-tắc-fut-test-chức-năng)
khi REQ/đặc tả cần.

- Tuyệt đối không tạo task, bước `Làm như thế nào`, REQ, QG, `Hoàn tất khi`
  hay `Đường dẫn được phép sửa` cho build, chạy ứng dụng/database/trình duyệt
  để nghiệm thu, đo hiệu năng, harness hay script kiểm chứng mới, deploy hay
  release. [Kiểm chứng layout bằng mock](layered-task-execution.instructions.md#kiểm-chứng-layout-bằng-mock)
  là việc Implement tự làm khi diff đổi giao diện: Plan không tạo task, bước
  hay QG riêng cho nó, kể cả bước đánh số giao vai trò triển khai chụp layout.
  QG giao diện vẫn viết thành logic layout/trạng thái. Điều cần chụp hoặc đo
  thêm so với router (khổ do người dùng yêu cầu, ngưỡng tính được từ source,
  thuộc tính tính toán cần ghi) nằm trong logic của QG giao diện và trong
  `Hoàn tất khi` của vai trò triển khai; cách dựng trạng thái chưa có diff
  thuộc router.
- Khi task có test, nêu REQ/hành vi được test, chức năng bị ảnh hưởng kèm căn
  cứ (call path, hợp đồng hay dữ liệu dùng chung bị đổi), file test được phép
  sửa và đúng các test được chạy. Không giao test cho chức năng không liên
  quan, không giao chạy toàn bộ suite, không tự đặt quan điểm test ngoài đặc tả.
- Mục tiêu của đặc tả thuộc giai đoạn người dùng (ngưỡng hiệu năng, kiểm thử
  thiết bị, chạy toàn hệ thống, phát hành) không thành phần việc của gói; ghi
  một dòng trong `Cần làm gì` rằng nó thuộc giai đoạn build/test/release của
  người dùng.
- QG không lấy kết quả test/build/chạy làm baseline. Không viết QG dạng "test
  X xanh", "bộ test đầy đủ xanh", "`npm run build` đạt", "trên trình duyệt
  thấy…", "có bằng chứng trên database thật" hay một số đo. Viết logic source
  phải bảo đảm: tình huống → nơi xử lý → kết quả/trạng thái và nhánh lỗi, đủ để
  vai trò kiểm chứng lần theo source mà kết luận. Ví dụ, thay "test đăng ký xanh"
  bằng "mã hợp lệ tạo tài khoản `PENDING`; mã sai trả `400` và không ghi dữ liệu".

## Tách vai trò triển khai và vai trò kiểm chứng

- `implementation_roles` tạo đầu ra của task. `verification_roles` không sửa
  đầu ra; sau khi vai trò triển khai xong, chúng kết luận từng QG bằng lập luận
  theo [hợp đồng Implement](implement.instructions.md#kiểm-chứng-quality-gate-bằng-lập-luận).
  Mỗi task có ít nhất một vai trò mỗi loại, và hai danh sách không giao nhau:
  một vai trò không kiểm chứng phần chính nó triển khai.
- Chọn vai trò triển khai trong danh mục của
  [Implement](implement.instructions.md#vai-trò-ai-agent-tại-layer-implement)
  theo phần việc: `backend-developer` cho mọi code không phải giao diện (API,
  domain, dữ liệu, job, CLI, script, công cụ), `frontend-developer` cho giao
  diện, `technical-writer` cho task chỉ có tài liệu. Khi task có cả hai phía,
  ghi đúng thứ tự phụ thuộc, ví dụ `backend-developer` trước khi
  `frontend-developer` dùng API mới.
- Chọn vai trò kiểm chứng theo câu hỏi QG cần trả lời, không ghép cứng theo vai
  trò triển khai:
  - `code-reviewer` phản biện diff: bug, hồi quy, quyền và bảo mật, mất nhất
    quán dữ liệu/trạng thái, guard/validator/xử lý lỗi báo thành công giả,
    vi phạm hợp đồng; mặc định cho mọi thay đổi code.
  - `code-analyst` lần luồng từ entrypoint tới trạng thái cuối qua mọi
    caller/consumer, lập bảng kịch bản cho QG nhiều nhánh, trạng thái hoặc thứ
    tự; hợp với đổi hợp đồng, nhiều điểm tích hợp, hoặc tài liệu phải khớp
    source.
  - `ux-designer` đối chiếu ảnh layout với QG giao diện; chọn khi task có QG
    giao diện.

  Ví dụ: bug-fix một lỗi → `code-reviewer`; đổi API kèm tài liệu →
  `code-reviewer` cho quyền/hồi quy và `code-analyst` cho consumer và tài liệu;
  thêm màn hình → `code-reviewer` và `ux-designer`. Chỉ ghép nhiều vai trò khi
  mỗi vai trò trả lời câu hỏi riêng; mỗi QG có đúng một vai trò kiểm chứng chịu
  kết luận.
- Kiểm chứng không phải chạy script, tạo test hay chạy lệnh. Không giao vai trò
  kiểm chứng việc build, viết/chạy test, chạy ứng dụng hay viết công cụ; test
  thuộc vai trò triển khai. `Hoàn tất khi` của vai trò kiểm chứng là kết luận
  `PASS|FAIL|BLOCKED` cho từng QG được giao, kèm đường đã lần, phản ví dụ và
  nguồn, cùng đối chiếu test trong diff với FUT khi task có test.

## Nội dung phải đủ để thực hiện

- Mỗi REQ có nguồn và kết quả cụ thể; QG nói khi nào được phép/từ chối, trạng
  thái cần giữ và nhánh lỗi liên quan. Chỉ đưa vào rủi ro có cơ chế trong phạm vi
  yêu cầu, không tự bổ sung nền tảng, coverage hoặc vận hành chưa được giao.
- `Đường dẫn được phép sửa` gồm cả các tài liệu đã biết đang mô tả hành vi sẽ đổi
  (hợp đồng của task trước, mục lục, bảng trạng thái, danh mục API/lỗi/cấu hình/
  quyền): tìm theo tên route, mã lỗi, collection, cấu hình, token, tên file
  hoặc cụm kiểu "đến task N" rồi nêu tên chúng. Phần còn sót vẫn do Implement
  quét theo hợp đồng của nó; Plan không cần liệt kê hết mọi nơi.
- Bước xử lý nêu điểm sửa, hướng đã chọn, thứ tự thật sự cần và kết quả. Chốt
  các quyết định ảnh hưởng API/dữ liệu/ownership; để chi tiết cài đặt tương đương
  cho Implement chọn. Không giấu một quyết định còn thiếu trong từ “tích hợp”.
- Chọn `implementation_roles` và trách nhiệm theo công việc, không theo số
  layer hoặc số thư mục; chọn `verification_roles` theo mục trên. Không giao
  nhiều vai trò cùng chịu trách nhiệm một quyết định mà không có chủ hợp nhất.
- Đọc lại bằng một tình huống chính và tình huống có thể bác bỏ hướng làm.
  Tiêu chí đúng là hành vi source phải bảo đảm, lập luận được trên source;
  test/build/validator PASS không thay được logic đó. Khi nhiệm vụ là nội
  dung, tiêu chí là chỉ dẫn dẫn tới quyết định đúng, không phải công cụ chấp
  nhận văn bản.

## Mẫu đầu ra

Giữ bốn mục; chỉ thêm chi tiết làm đổi cách thực hiện, không thêm báo cáo của
mỗi vai trò hoặc checklist thành mục thứ năm.

````markdown
---
schema: pirl-plan/v1
content_language: vi
plan_set: <request-slug>_<YYYYMMDD-HHmmss>
task_id: T01
title: "<Tên công việc>"
layer: implement
status: planned
depends_on: []
created_at: "<ISO-8601 với +07:00>"
target_repo: "<Đường dẫn repo đích trong .repos/manifest.yaml, hoặc . cho chính Hub>"
source_request: "<Yêu cầu ngắn gọn của người dùng>"
planning_roles: [<vai-trò-lập-plan>]
implementation_roles: [<vai-trò-triển-khai>]
verification_roles: [<vai-trò-kiểm-chứng>]
---

# T01: <Tên công việc>

## Cần làm gì

- REQ-01 | Nguồn: <Yêu cầu hoặc file/symbol đã đọc> | Yêu cầu: <Hành vi nghiệp vụ cần đạt>
- Phạm vi: <Phần việc được thực hiện; phần loại trừ chỉ ghi khi cần tránh hiểu sai>.
- Đường dẫn được phép sửa: `<đường-dẫn-cụ-thể của source, tài liệu và test theo FUT nếu có>`.
- Kết quả riêng của task: <Đầu ra có thể nghiệm thu khi các task chạy sau/song song chưa được triển khai>.
<Nếu đặc tả có mục tiêu build/test/release: một dòng rằng nó thuộc giai đoạn build/test/release của người dùng>.

## Làm như thế nào

1. <ROLE-01: sửa file/symbol nào, xử lý thế nào và kết quả gì; thêm bước khi có phụ thuộc thật>.
<Nếu có test: ROLE-01 viết/cập nhật test theo FUT cho REQ nào và chức năng bị ảnh hưởng nào, chỉ chạy đúng các test đó (file/class/tên)>.
2. <ROLE-02: sau ROLE-01, lập luận trên diff/source để kết luận QG nào; không chạy lệnh/test>.

<Nếu có depends_on: đầu ra cụ thể cần nhận từ từng task tiên quyết>.
<Nếu có tiêu chí toàn luồng giao task khác: task sở hữu và phần tích hợp cần kiểm chứng; không là QG của task này>.
<Điều kiện đầu vào hoặc quyết định cần dừng, nếu có>.
Bước tiếp theo: người dùng chỉ định file Plan này để Implement sau khi các sửa
lỗi nội dung Plan đã hoàn tất; Implement chỉ thực hiện task này trong phạm vi trên.

## Vai trò tham gia

- ROLE-01 | Loại: triển khai | Vai trò: <vai-trò-triển-khai> | Phụ trách: <Phần việc cụ thể> | Đầu vào: <Thông tin hoặc kết quả phụ thuộc> | Hoàn tất khi: <Source/tài liệu phải giao>
- ROLE-02 | Loại: kiểm chứng | Vai trò: <vai-trò-kiểm-chứng> | Phụ trách: <QG và câu hỏi phải trả lời> | Đầu vào: <Diff/source của ROLE-01> | Hoàn tất khi: <Kết luận PASS/FAIL/BLOCKED từng QG bằng lập luận có nguồn>
- Lập Plan | Vai trò: <các vai trò trong planning_roles> | Cách thực hiện: <agent riêng hoặc người điều phối tự thực hiện kèm lý do không giao được; ghi theo từng vai trò khi khác nhau>

## Tiêu chí chất lượng bắt buộc

- QG-01 | Yêu cầu: REQ-01 | Logic bắt buộc: <Tình huống → nơi xử lý → kết quả/trạng thái và nhánh lỗi; lập luận được trên source với đầu vào tiên quyết và thay đổi của task này, không cần test/build/chạy hay task chạy sau/song song>
````

## Tự rà soát trước bàn giao

1. Đối chiếu đóng góp từng vai trò với yêu cầu, source, phương án và QG. Nếu
   Plan sai hoặc thiếu quyết định bắt buộc, sửa nội dung trước khi tuyên bố
   sẵn sàng. Với gói nhiều task, đối chiếu khả năng nghiệm thu riêng theo
   mục chia task ở trên và xác nhận mọi yêu cầu toàn gói vẫn có task sở hữu.
   Xác nhận mỗi task tách vai trò triển khai với vai trò kiểm chứng hợp câu hỏi
   của QG, không có task, bước hay QG nào thuộc giai đoạn build/test/release
   của người dùng, không có QG riêng cho việc chụp layout, và phần test (nếu
   có) giới hạn theo FUT. Trước khi tuyên bố sẵn sàng, đọc lại Plan với năm
   kiểm sau và sửa Plan nếu sai:
   - Mọi khẳng định về hiện trạng (mục, bảng, file, hành vi, ngôn ngữ đang có)
     đã được mở ra và xác nhận tại đúng từng vị trí hoặc ngôn ngữ mà Plan nêu;
     phần chưa có thì REQ ghi rõ là tạo mới.
   - Mọi bảng giá trị hay số dẫn xuất kèm ràng buộc đo được (tương phản, độ
     sáng, kích thước, giới hạn) đã được tính lại từng giá trị với từng ràng
     buộc; mâu thuẫn thì sửa bảng hoặc ràng buộc, không bàn giao cả hai.
   - REQ đổi một phần tử ghép từ nhiều phần (nhãn, biểu tượng, đường viền,
     nền) nêu phần nào giữ, bỏ, thêm.
   - Lệnh FUT chỉ nêu file test đã có, hoặc file test mà REQ chốt tên để task
     tạo; khi Plan để Implement chọn giữa sửa hay thay một đơn vị (ví dụ thay
     một hook), gọi file test theo đơn vị đó ("file test của hook thay thế")
     thay vì đặt tên một file có thể không còn. `Đường dẫn được phép sửa` gồm
     file thiết lập hay cấu hình dùng chung của test mà thay đổi cần (ví dụ bản
     giả của một API trình duyệt mà môi trường test thiếu).
   - Không bước nào của `Làm như thế nào` giao vai trò triển khai chụp layout,
     đo hay chạy ứng dụng, kể cả bước ngắn "chụp layout theo router": khổ,
     trạng thái và thuộc tính cần chụp thêm nằm trong QG giao diện và trong
     `Hoàn tất khi` của vai trò triển khai. Bước của vai trò kiểm chứng giao
     diện chỉ ghi chạy sau khi vai trò triển khai chụp.
2. Chạy validator Plan và sửa lỗi cấu trúc trước khi bàn giao:

   ```powershell
   python -B .agents/llm-docs/evals/validate_layer_artifact.py --kind plan --path <file Plan hoặc thư mục gói>
   ```

   Validator chỉ kiểm tra đầu vào bàn giao (schema, trường bắt buộc, vai trò,
   phụ thuộc, múi giờ); nó không chấm nội dung. Người rà soát vẫn phải chứng
   minh Plan đúng.
3. `process-auditor` tự đánh giá lượt Plan, áp dụng cải tiến và ghi record
   theo [router](layered-task-execution.instructions.md#tự-đánh-giá-và-cải-tiến).
   Lỗi của chính Plan được sửa trong Plan trước khi bàn giao; lỗi hướng dẫn
   không biến thành yêu cầu sản phẩm mới.

## Lưu và bàn giao

- Sau lần rà soát và tự đánh giá cuối, người điều phối và mọi vai trò hoàn tất
  [dọn tài nguyên tạm](layered-task-execution.instructions.md#dọn-tài-nguyên-tạm-trước-bàn-giao)
  và kiểm lại trước khi nhận Plan sẵn sàng. Nháp bị chặn vẫn phải dọn phần
  không còn cần; không giao rác của Plan cho Implement.
- Giữ schema `pirl-plan/v1`, múi giờ `+07:00`, slug ASCII kebab và tên
  `<NN>-plan-<todo-slug>-<timestamp>.md` trong
  `.agents/plan/<request-slug>_<YYYYMMDD-HHmmss>/`. Task ID từ T01 liên tục,
  các file cùng gói dùng cùng timestamp. Không ghi đè lịch sử.
- Ghi rõ Plan đã đủ quyết định hay còn phần chưa chốt, đường dẫn và kết quả tự
  cải tiến theo mục báo cáo của router. Không gọi nháp chưa đủ đầu vào là sẵn
  sàng Implement.
- Không sửa source sản phẩm tại Plan. Kết thúc và bàn giao file cụ thể cho
  chỉ thị Implement tương ứng; không tự chạy task tiếp.
