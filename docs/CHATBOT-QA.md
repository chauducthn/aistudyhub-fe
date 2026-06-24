# QA — AI Chatbot flow (SCRUM-45)

Checklist để test chatbot trên **Swagger** và **Frontend** sau khi BE + FE chạy local.

## Chuẩn bị

| Service | URL |
|---------|-----|
| Backend | http://localhost:8081 |
| Swagger | http://localhost:8081/swagger-ui.html |
| Frontend | http://localhost:5173 |

1. Chạy `aistudyhub-be` (`run-dev.ps1`) và `aistudyhub-fe` (`npm run dev`).
2. Có ít nhất 2 user: **User A** (owner) và **User B** (viewer).
3. User A upload file `.txt` (nội dung rõ ràng, ví dụ `polymorphism notes`).

---

## A. Swagger — nhóm **Chatbot**

### 1. Đăng nhập lấy token

`POST /api/auth/login` → copy `accessToken` → **Authorize** Bearer.

### 2. Chat không document (SCRUM-12)

`POST /api/chatbot/messages`

```json
{ "message": "Explain binary search in 3 bullets" }
```

**Kỳ vọng:** `200`, `data.response` có nội dung, `data.model` = `LOCAL_STUDY_ASSISTANT` (test) hoặc tên model Gemini (nếu cấu hình `app.ai.provider=gemini`).

### 3. Chat với document của mình

Upload: `POST /api/documents` (multipart: `file`, `title`).

```json
{ "documentId": <id>, "message": "Summarize this document" }
```

**Kỳ vọng:** `200`, `data.documentId` khớp, response nhắc nội dung file (nếu `extractionStatus=EXTRACTED`).

### 4. Chat với public document (SCRUM-46)

User A: `PATCH /api/documents/{id}/visibility` → `{ "status": "PUBLIC" }`.

User B (token khác): gửi cùng `documentId`.

**Kỳ vọng:** `200` — user khác chat được tài liệu public.

### 5. Không chat private document người khác (SCRUM-46)

User A để document `PRIVATE`. User B gửi `documentId` đó.

**Kỳ vọng:** `403` — message có *permission* / private document.

### 6. Lịch sử & xóa

- `GET /api/chatbot/history` → có các message vừa gửi.
- `DELETE /api/chatbot/history` → `totalElements` = 0 sau khi GET lại.

---

## B. Frontend — `/chatbot` (SCRUM-47)

1. Đăng nhập User A → **AI Chatbot** trong sidebar.
2. Gửi câu hỏi không chọn document → bubble user + bot hiện, **Model** dưới reply.
3. Chọn document trong dropdown → badge **AI Text** (Extracting / Ready for AI / Extraction failed).
4. Gửi câu hỏi có `documentId` → reply hiện *Based on: &lt;title&gt;*.
5. **Clear History** → màn hình trống, F5 vẫn trống.

### Public document (2 tài khoản)

1. User A: My Documents → đổi visibility **Public**.
2. User B: Chatbot → dropdown có tài liệu public → chat thành công.
3. User B thử document private của A (nếu biết id qua devtools) → lỗi *cannot chat with this private document*.

---

## C. Text extraction (SCRUM-49)

| Bước | Kỳ vọng |
|------|---------|
| Upload `.txt` / `.pdf` / `.docx` | My Documents cột **AI Text** → `Ready for AI` khi BE extract xong |
| Upload format lỗi / file hỏng | `Extraction failed` + tooltip lỗi |
| Chatbot chọn doc `Ready for AI` | Response dùng nội dung đã extract |
| Chatbot chọn doc `Extracting` | Vẫn chat được; response có thể báo context chưa sẵn |

---

## D. Gemini (SCRUM-12) — môi trường dev

Trong `aistudyhub-be/.env`:

```env
app.ai.provider=gemini
app.ai.gemini.api-key=<your-key>
app.ai.fallback-to-local=true
```

Gửi lại bước A.2 → `data.model` không còn `LOCAL_STUDY_ASSISTANT` nếu Gemini OK.

---

## Pass criteria (SCRUM-45)

- [ ] Swagger: 5 case A.2–A.6 đều đúng status.
- [ ] FE: gửi/nhận message, hiển thị model + document context.
- [ ] Access control: public OK, private người khác **403**.
- [ ] Extraction status hiển thị trên My Documents + Chatbot picker.

Ghi lại screenshot + ghi chú lỗi vào Jira SCRUM-45 khi QA xong.
