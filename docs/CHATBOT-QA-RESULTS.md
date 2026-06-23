# SCRUM-45 — QA results

**Date:** 2026-06-15  
**Environment:** Local — BE `http://localhost:8081`, FE `http://localhost:5173`  
**Tester:** Automated API script + FE build verification

---

## A. Swagger / API (automated — `run-chatbot-qa.ps1`)

| Case | Expected | Result |
|------|----------|--------|
| Register 2 users | 201 + token | PASS |
| A.2 Chat without document | 200, `model`, `response` | PASS (`LOCAL_STUDY_ASSISTANT`) |
| Upload `.txt` document | 200, `extractionStatus=EXTRACTED` | PASS |
| A.3 Chat own document | 200, `documentId`, context in reply | PASS |
| A.5 Private doc — other user | **403** | PASS (after BE restart with SCRUM-46) |
| A.4 Public doc — other user | 200 | PASS |
| A.6 History owner | 2 messages | PASS |
| A.6 History viewer | 1 message | PASS |
| A.6 Clear history | 0 messages | PASS |

**API summary:** 10/10 PASS

---

## B. Integration test (JUnit)

`ChatbotControllerIntegrationTest` — **PASS** (1/1)

- Private document from another user → 403
- Public document from viewer → 200
- Owner history = 2, viewer history = 1
- Admin metrics `chatbotApiCalls` = 3

Run: `aistudyhub-be/run-chatbot-test.ps1`

---

## C. Frontend build

`npm run build` — **PASS**

---

## D. Frontend manual checklist (`/chatbot`, SCRUM-47)

| Item | Status | Notes |
|------|--------|-------|
| Send message without document | Manual | UI wired to `POST /api/chatbot/messages` |
| Model label under bot reply | Manual | `ChatbotPage` shows `data.model` |
| Document picker (own + public) | Manual | `listChatContextDocuments()` |
| Extraction badge in picker | Manual | `ExtractionStatusBadge` |
| `?doc=` preselect | Manual | `useSearchParams` |
| 403 error message for private doc | Manual | Handled in `ChatbotPage` |
| Clear history | Manual | Calls `DELETE /api/chatbot/history` |

---

## E. Text extraction UI (SCRUM-49)

| Screen | Component | Status |
|--------|-----------|--------|
| My Documents | `ExtractionStatusBadge` column **AI Text** | Implemented |
| Public Documents list | **AI Text** column | Implemented |
| Document detail (owner) | `ExtractionStatusPanel` + chat link | Implemented |
| Public document detail | `ExtractionStatusPanel` | Implemented |
| Upload success | `ExtractionStatusPanel` (compact) | Implemented |
| Chatbot picker | Badge + disable FAILED | Implemented |

---

## Pass criteria (SCRUM-45)

- [x] Swagger/API: cases A.2–A.6 correct status
- [x] Access control: public OK, private other user **403**
- [x] Extraction status on document screens + chatbot picker
- [ ] FE manual smoke (send/receive bubbles) — verify in browser at `/chatbot`

---

## Notes

1. **BE restart required** after `ChatbotService` change; old process returned 404 instead of 403.
2. Gemini (SCRUM-12): not tested live; test profile uses `app.ai.provider=local`.
3. Attach screenshots from manual FE pass to Jira SCRUM-45 when convenient.
