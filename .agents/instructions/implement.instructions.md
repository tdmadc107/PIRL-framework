---
name: "Hướng dẫn layer Implement"
description: "Triển khai đúng Plan hoặc chỉ dẫn sửa của Review, để vai trò kiểm chứng kết luận quality gate bằng lập luận và ghi Implementation Record vào Plan."
applyTo: ".agents/instructions/implement.instructions.md"
metadata:
  id: ".agents/instructions/implement"
  kind: "instruction"
  version: "1.2.0"
  status: "active"
---

# Hướng dẫn layer Implement

Chỉ áp dụng quy trình Implement khi yêu cầu và [router](layered-task-execution.instructions.md)
đã chọn layer này. Đọc hoặc cập nhật một file Plan/report không tự kích hoạt
layer khác. Việc giao thẳng ngoài một Plan theo
[task độc lập của router](layered-task-execution.instructions.md#task-độc-lập);
không mượn quy tắc chờ Review của layer này cho việc đó.

Đây là nguồn quy trình và sổ kết quả Implement. Mục tiêu là thực hiện đúng
quyết định sản phẩm đã chốt, giữ bằng chứng đủ bàn giao và nhận ra lúc quyết
định đó không còn phù hợp.

## Vai trò AI Agent tại layer Implement

Danh mục vai trò và nguyên tắc giao việc nằm ở [AGENTS.md](../../AGENTS.md#vai-trò-ai-agent);
chuyên môn của từng vai trò nằm trong file vai trò được liên kết trong bảng.
Plan chọn vai trò từ bảng dưới; lượt sửa dùng `repair_roles` của report Review.
Người điều phối Implement giao cho từng vai trò file vai trò, dòng của vai trò
đó trong bảng, phần việc, nguồn và REQ/QG liên quan, rồi hợp nhất kết quả theo
bằng chứng.

| Vai trò | Loại | Trách nhiệm tại Implement | Hoàn tất khi |
| --- | --- | --- | --- |
| [`backend-developer`](../roles/backend-developer.role.md) | triển khai | Sửa code không phải giao diện, tài liệu đi kèm và test theo FUT cho phần đó, trong đường dẫn được phép; tự phản biện phần mình làm | Source/tài liệu/test giao đủ REQ của phần mình; tự phản biện không còn nghi vấn mở |
| [`frontend-developer`](../roles/frontend-developer.role.md) | triển khai | Sửa giao diện, chuỗi giao diện theo ngôn ngữ, tài liệu đi kèm và test theo FUT; chụp layout bằng mock khi diff đổi giao diện; tự phản biện | Như trên, và `layout_verification` có lần chụp đạt mọi kiểm khi diff đổi giao diện; khi diff đổi kích thước hoặc số phần tử trong hàng hay khung có bề rộng ràng buộc, số đo hộp bao theo [router](layered-task-execution.instructions.md#kiểm-chứng-layout-bằng-mock) nằm trong `layout_verification` và phần tử nhô ra đã được sửa trước khi giao vai trò kiểm chứng |
| [`technical-writer`](../roles/technical-writer.role.md) | triển khai | Tạo/cập nhật tài liệu ngữ cảnh, tài liệu hợp đồng, mục lục, bảng trạng thái đặc tả cho task chỉ có tài liệu | Tài liệu khớp source và REQ; mỗi khẳng định có nguồn |
| [`code-reviewer`](../roles/code-reviewer.role.md) | kiểm chứng | Phản biện diff: bug, hồi quy, quyền và bảo mật, mất nhất quán dữ liệu/trạng thái, guard/validator/xử lý lỗi, vi phạm hợp đồng, test vi phạm FUT | `PASS\|FAIL\|BLOCKED` từng QG được giao, kèm đường đã lần, phản ví dụ, nguồn |
| [`code-analyst`](../roles/code-analyst.role.md) | kiểm chứng | Lần luồng từ entrypoint tới trạng thái cuối qua mọi caller/consumer chịu ảnh hưởng; lập bảng kịch bản cho QG nhiều nhánh/trạng thái/thứ tự; đối chiếu tài liệu với source | Như trên |
| [`ux-designer`](../roles/ux-designer.role.md) | kiểm chứng | Đối chiếu ảnh và bảng kết quả layout với QG giao diện và source hiển thị | Như trên |
| [`process-auditor`](../roles/process-auditor.role.md) | tự đánh giá | Tự đánh giá lượt Implement theo [router](layered-task-execution.instructions.md#tự-đánh-giá-và-cải-tiến); không ghi vào danh sách vai trò của Plan | Record đã ghi; cải tiến đã áp dụng hoặc đã tổng hợp cho người dùng |

- Vai trò triển khai không kiểm chứng phần chính nó làm. Vai trò kiểm chứng
  không sửa đầu ra; FAIL được trả cho vai trò triển khai sở hữu phần đó.
- Vai trò kiểm chứng nhận thêm diff và tuyên bố của vai trò triển khai như
  điều cần kiểm, không như kết luận. Đồng thuận của đội không là bằng chứng.
- Khi một agent đảm nhận cả triển khai lẫn kiểm chứng, Implementation Record
  ghi đó là tự thực hiện và QG vẫn do đúng vai trò kiểm chứng lập luận lại
  trên diff; không tuyên bố đã có kiểm chứng độc lập.

## Đọc đầu vào và xác định phạm vi

1. Xác định đúng file Plan được người dùng hoặc ngữ cảnh đã chốt chỉ định.
   Đọc Plan `pirl-plan/v1`, source liên quan và Implementation Record nếu có.
   Kiểm tra các task trong `depends_on` đã thực hiện phần mà task này cần; chỉ
   dừng phần phụ thuộc chưa sẵn sàng. Không yêu cầu task tương lai hoàn tất,
   không tự chọn task tiếp theo. Plan sai nội dung phải được làm rõ trước
   mutation phụ thuộc; thiếu một lần chạy validator không tự chứng minh Plan sai.
   Nếu QG cần phần việc giao cho task chạy sau/song song, đối chiếu
   [ranh giới task của Plan](plan.instructions.md#chia-task-để-triển-khai-và-nghiệm-thu-riêng),
   ghi QG bị ảnh hưởng `BLOCKED` và bàn giao đúng quyết định chia task cho
   Plan. Không tự làm task kia, hạ QG hay lặp sửa code khi đầu vào chưa đổi;
   tiếp tục phần độc lập đã rõ.
2. Lượt đầu dùng `implementation_roles` của Plan đúng thứ tự để triển khai,
   rồi `verification_roles` của Plan đúng thứ tự để kiểm chứng. Lượt sửa
   dùng `repair_roles` của report Review được chỉ định, cùng Plan/task,
   rồi vẫn `verification_roles` của Plan. Không tự gộp hai đội, đổi vai trò
   theo tên lỗi, thêm hoặc bỏ vai trò được giao. Report còn FIND `replan`
   quay về Plan; chỉ có risk trì hoãn hoặc blocker chuyển chủ không mở lượt
   sửa sản phẩm.
3. Đối chiếu yêu cầu, trách nhiệm, đường dẫn cho phép, phụ thuộc và QG với
   hiện trạng. Phân biệt thay đổi có sẵn của người dùng với phần mình sẽ sửa.
   Dùng quyền đã có trong phiên; không thêm checkpoint phê duyệt thường lệ.
4. Mỗi vai trò nhận phần việc, nguồn, chỉ dẫn và REQ/QG liên quan. Chỉ nạp
   context phục vụ quyết định đó. Khi giao việc cho agent riêng, truyền đủ
   hướng đã chốt; không giấu giải pháp để tạo vẻ độc lập. Thiếu khả năng giao
   việc không ngăn người điều phối thực hiện các vai trò lần lượt.
5. Tự chọn chi tiết cài đặt tương đương trong hướng đã chốt: vị trí helper,
   tên biến hoặc cách tái sử dụng source phù hợp không cần lập Plan mới.
   Chỉ chuyển lại quyết định làm đổi hành vi, quyền, dữ liệu, phạm vi hoặc
   đánh đổi đã được người dùng chốt. Nêu đúng phần thiếu và tiếp tục phần
   độc lập; không mặc định cả task bị chặn vì một nhánh chưa rõ.

## Triển khai và sửa theo Review

- Lần theo đường chạy từ đầu vào tới kết quả trước khi thay đổi. Giữ invariant
  tại nơi sở hữu nó, cập nhật các bên ghi/đọc chịu ảnh hưởng trong phạm vi.
  Không thêm abstraction, migration, nền tảng hay hạ tầng kiểm tra vì tiện thể.
- Danh sách đường dẫn của Plan là phạm vi của việc chính, không phải ranh giới
  của tính nhất quán. Khi hành vi đã ổn định, quét toàn repo đích và tài liệu
  ngữ cảnh liên quan, không chỉ thư mục của task, để tìm nơi còn mô tả hành vi
  cũ hoặc chưa có hành vi mới: tài liệu hợp đồng, mục lục và bảng trạng thái,
  danh mục API/lỗi/cấu hình/quyền, chuỗi giao diện, comment hoặc mã chỉ còn
  phục vụ luồng bị thay. Đó là hệ quả trực tiếp của thay đổi nên sửa trong
  cùng lượt dù nằm ngoài đường dẫn Plan. Test của chức năng đang phát triển và
  chức năng bị ảnh hưởng còn khẳng định hành vi cũ được cập nhật theo logic
  mới, test chỉ phục vụ luồng đã gỡ thì xóa, đều theo
  [quy tắc FUT](../llm-docs/rules/test-verification.rule.md#quy-tắc-fut-test-chức-năng);
  không đụng test của chức năng không liên quan, không dựng harness hay script
  kiểm chứng mới trong repo (script mock chụp layout nằm trong `.tmp/` theo
  [router](layered-task-execution.instructions.md#kiểm-chứng-layout-bằng-mock)
  không thuộc điều cấm này). Điểm cần quyết định sản phẩm thì ghi vào nơi dự
  án lưu khoảng trống đã biết và vào rủi ro còn lại, không tự chọn. Không sửa
  hồ sơ lịch sử (Plan đã chốt, report Review, nội dung đặc tả gốc); mục lục
  và bảng trạng thái triển khai của thư mục đặc tả là tài liệu sống nên vẫn
  đồng bộ. Quét lại khi hành vi đổi sau lần quét.
- Với lượt sửa, đọc mọi FIND/RISK/BLOCK, EVAL và disposition trong report. Xác nhận
  trigger và nguyên nhân bằng lập luận trên source (chỉ tái hiện khi lượt này
  được yêu cầu điều tra nguyên nhân gốc rễ theo router), tìm guard hay
  giải thích cạnh tranh có thể bác bỏ kết luận. Nếu report sai, ghi
  `contradicted` cùng nguồn; không sửa theo lỗi không tồn tại hoặc tự thay
  bằng nguyên nhân khác. Tiếp tục mục độc lập đã rõ và trả lại đúng mâu thuẫn
  cho Review trước khi nhận toàn bộ lượt sửa là hoàn tất.
- Sửa FIND `repair` và thực hiện hành động gỡ BLOCK `retry`. RISK `deferred`
  giữ chủ và điều kiện xem lại; BLOCK `escalate` giữ chủ có thể cung cấp đầu
  vào. Retry phải có hành động/điều kiện mới có căn cứ, không chạy lại để chờ may.
  Mục EVAL ghi đánh giá vai trò của lượt trước và cải tiến framework mà Review
  đã áp dụng; đọc để biết quy tắc đã đổi, nhưng không biến nó thành FIND hoặc QG
  sản phẩm mới.
- Giữ bằng chứng trước/sau cho cơ chế cần sửa bằng lập luận trên source:
  đường chạy cũ dẫn tới lỗi và điểm sửa chặn nó, kèm phản ví dụ phân biệt
  lỗi với hành vi hợp lệ. Không build hay chạy ứng dụng để làm bằng chứng;
  test theo FUT, khi Plan giao, chỉ bổ sung cho lập luận. Lượt sửa chạm giao
  diện chụp lại layout theo mục kiểm chứng bên dưới vào thư mục lần chạy mới.

## Kiểm chứng quality gate bằng lập luận

Theo [router](layered-task-execution.instructions.md#kiểm-chứng-bằng-lập-luận),
lượt Implement không build, không chạy ứng dụng để nghiệm thu, chỉ viết,
cập nhật và chạy test theo FUT, và không lấy kết quả test/build làm bằng chứng QG.
Khi diff đổi giao diện, `frontend-developer` (hoặc người điều phối khi tự thực
hiện vai trò này) thực hiện [kiểm chứng layout bằng mock](layered-task-execution.instructions.md#kiểm-chứng-layout-bằng-mock)
sau khi triển khai và trước khi giao vai trò kiểm chứng; ảnh và bảng kết quả
là nguồn cho vai trò kiểm chứng, không thay lập luận của nó.
Khi Plan giao test, vai trò triển khai chỉ chạy test của chức năng đang phát
triển và chức năng bị ảnh hưởng. Test đỏ được giải thích bằng source trước khi
sửa sản phẩm hoặc test; không sửa test để khớp code sai, không thêm test hay
mở rộng lần chạy để tăng độ tin.

Mỗi vai trò triển khai tự phản biện phần mình làm: đối chiếu REQ và `Logic bắt
buộc` với source, chọn phản ví dụ hoặc nhánh biên có khả năng bác bỏ, sửa
thiếu sót trong phạm vi ngay khi thấy. Tự phản biện không thay kết luận của
vai trò kiểm chứng.

Sau khi đội triển khai/sửa xong, từng vai trò kiểm chứng xử lý QG được giao:

1. Đọc diff cùng source lân cận; lần từ entrypoint qua caller, guard, thao tác
   ghi/đọc tới kết quả và trạng thái mà `Logic bắt buộc` nêu, gồm nhánh từ
   chối/thất bại cần giữ. Với QG về giao diện, xem thêm ảnh và bảng kết quả
   của lần chụp layout mới nhất; thiếu chúng khi diff đổi giao diện thì trả
   FAIL cho `frontend-developer`.
2. Chọn phản ví dụ có thể xuất hiện trong phạm vi QG, tìm guard hoặc giải
   thích cạnh tranh, rồi xét source có bác bỏ tuyên bố hoàn tất không.
3. Khi task có test, đọc test trong diff và đối chiếu FUT: truy về REQ, đúng
   chức năng đang phát triển và chức năng bị ảnh hưởng, không trùng, không
   khẳng định điều đặc tả không đòi. Vi phạm được trả như một FAIL.
4. Ghi `PASS|FAIL|BLOCKED` cho từng QG cùng tuyên bố, đường đã lần, phản ví dụ
   và nguồn. `FAIL` khi chỉ ra được trigger → cơ chế → hậu quả vi phạm QG;
   `BLOCKED` khi thiếu nguồn hoặc quyết định cần để kết luận, không phải vì
   chưa chạy test.

FAIL được trả cho vai trò triển khai sở hữu phần đó kèm trigger, cơ chế và
đích sửa; sau khi sửa, vai trò kiểm chứng lập luận lại phần chịu ảnh hưởng.
Tối đa hai lần sửa cùng nguyên nhân trong lượt; còn FAIL thì ghi `failed`
cùng bằng chứng. Không hạ QG để khớp code hay thêm QG giữa lượt.

Implement tự kiểm tra sản phẩm, không đổi kết luận Review. Sau khi ghi
Implementation Record, `process-auditor` tự đánh giá lượt Implement, áp dụng cải
tiến framework và ghi record theo
[router](layered-task-execution.instructions.md#tự-đánh-giá-và-cải-tiến). Lỗi
đầu ra mà `process-auditor` tìm thấy được trả về vai trò triển khai sở hữu phần
đó, trong cùng giới hạn hai lần sửa ở trên.

## Ghi kết quả

Cập nhật trạng thái Plan và một mục `Implementation Record` bên dưới bốn mục
nội dung Plan. Ghi việc thực tế, nguồn, thay đổi, bằng chứng QG, tự phản biện
và giới hạn. Lượt sửa thay tham chiếu bằng record của chính lượt đó, không
sửa nội dung Plan để hợp thức hóa hướng đã tự đổi.

```markdown
## Implementation Record
- status: awaiting_confirmation | implemented | blocked | failed
- updated_at: "<ISO-8601 với +07:00>"
- changed_paths: <đường dẫn tương đối hoặc []>
- role_work: <vai-trò=trạng thái/bằng chứng, kèm lệnh và phạm vi test theo FUT nếu có; ...>
- execution_mode: <agent riêng theo vai trò | tự thực hiện lần lượt>
- checkpoint_evidence: <checkpoint, bằng chứng và đầu vào tiếp tục; hoặc N/A>
- quality_gate_results: <QG-01=PASS|FAIL|BLOCKED theo kết luận của vai trò kiểm chứng; ...>
- quality_gate_evidence: <từng QG -> vai trò kiểm chứng, file/symbol, đường đã lần, phản ví dụ và kết luận>
- layout_verification: <N/A khi diff không đổi giao diện; hoặc trạng thái đã chụp, ngôn ngữ, khổ màn hình, revision nền, số ảnh, kiểm đạt/không đạt và thư mục .tmp/layout-snapshots/...>
- repair_closure_evidence: <từng mục report -> REQ/QG, nguyên nhân, giải pháp/disposition và bằng chứng trước/sau phù hợp; hoặc đúng N/A cho lượt đầu>
- root_cause_revalidation: <ITEM-ID=confirmed|contradicted|blocked/bằng chứng trước sửa; hoặc đúng N/A cho lượt đầu>
- review_item_disposition: <FIND-01=resolved|failed|blocked/bằng chứng; RISK-01=deferred/chủ xử lý và điều kiện xem lại; BLOCK-01=unblocked|blocked|escalated/bằng chứng; hoặc đúng N/A cho lượt đầu>
- role_challenge_results: <vai-trò=PASS|FAIL|BLOCKED/tuyên bố, phản biện và bằng chứng; ...>
- residual_risk: <rủi ro còn lại và tác động; hoặc none>
- review_handoff: <file Plan, đối tượng triển khai, report nguồn nếu có>
- role_selection_source: plan | <đường dẫn report nguồn tương đối>
- effective_implementation_roles: <danh sách vai trò đúng thứ tự, phân cách bằng dấu phẩy>
- Next allowed owner/layer: <chủ xử lý/layer>
- Authorization condition: <đầu vào hoặc quyết định cho bước tiếp theo>
1. <hành động cụ thể và đường dẫn liên quan>
```

Validator đọc nguyên văn hai trường `status` và `updated_at`: ghi đúng mẫu,
không bọc backtick, không thêm dấu chấm cuối; các trường còn lại là văn bản
tự do. Sau khi ghi Implementation Record, chạy
`python -B .agents/llm-docs/evals/validate_layer_artifact.py --kind plan --path <file Plan>`
và sửa lỗi trước khi bàn giao.

`role_work` và `role_challenge_results` bao phủ mỗi vai trò triển khai/sửa rồi
mỗi vai trò kiểm chứng đúng một lần, đúng thứ tự; `effective_implementation_roles`
chỉ gồm đội triển khai/sửa. `changed_paths` nằm trong đường dẫn Plan cho phép;
file Plan đang ghi kết quả là ngoại lệ ghi sổ. Cập nhật nhất quán theo mục
quét ảnh hưởng là ngoại lệ thứ hai: liệt kê riêng trong `changed_paths` kèm
lý do đồng bộ, và ghi rõ trong `role_work` đã quét những gì để người đọc biết
phần nào được kiểm tra. `root_cause_revalidation` và `review_item_disposition`
luôn có mặt: lượt đầu ghi `N/A`, lượt sửa bao phủ mọi mục report theo thứ tự.
Report nguồn phải cùng Plan/task và dùng `pirl-review/v1`.

## Kết thúc và bàn giao

Người điều phối và mọi vai trò thực hiện
[dọn tài nguyên tạm](layered-task-execution.instructions.md#dọn-tài-nguyên-tạm-trước-bàn-giao)
sau lần kiểm chứng, ghi kết quả và tự đánh giá cuối, rồi kiểm lại trước bàn
giao. Không nhận lượt Implement hoàn tất hoặc để Review dọn thay; áp dụng cả khi
kết quả là failed/blocked, giữ source và bằng chứng chính thức theo hợp đồng
chung.

Chỉ ghi `implemented` khi yêu cầu và trách nhiệm vai trò đạt, vai trò kiểm chứng
kết luận mọi QG `PASS`, tự phản biện không còn nghi vấn mở và, khi diff đổi
giao diện, `layout_verification` có lần chụp đạt mọi kiểm.
Lượt sửa còn phải giải quyết FIND, ghi disposition cho mọi mục và gỡ các
blocker cần thiết. Không nhận đã sửa một finding mà nguyên nhân bị bác bỏ.
`failed` phản ánh tiêu chí bị vi phạm hoặc phần phải làm chưa đạt;
`blocked` phản ánh đầu vào/điều kiện bên ngoài còn thiếu.
`awaiting_confirmation` chỉ dùng ở checkpoint thật sự có trong Plan.
QG chưa đủ bằng chứng ghi `BLOCKED`, không tự nhận PASS.

Báo kết quả, bằng chứng có tính quyết định, phần chưa hoàn tất, liên kết
Plan và kết quả tự cải tiến theo mục báo cáo của router. Bàn giao source đã
triển khai, đúng Plan và report nguồn cho Review hoặc chủ gỡ chặn; chỉ rõ điều
kiện tiếp tục. Kết thúc lượt được giao, không tự mở Review, chọn task kế tiếp
hoặc xin lại quyền cho việc đã được giao.
