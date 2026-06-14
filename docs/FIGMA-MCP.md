# Figma MCP — SWP391 UI Design

## File thiết kế

- **Link:** https://www.figma.com/design/5ovQZG71O7DI3viL9nLX3v/SWP391-UI-DESIGN?node-id=2-830
- **fileKey:** `5ovQZG71O7DI3viL9nLX3v`
- **node-id (MCP):** `2-830` → `2:830`

Cấu hình trong code: `src/config/figmaDesign.js`

## Bật MCP trong Cursor (bắt buộc)

1. Chat agent: `/add-plugin figma` (nếu chưa cài)
2. **Cursor → Settings → MCP → Figma → Authenticate**
3. Đăng nhập Figma trong **≤ 2 phút** (tránh timeout)
4. Kiểm tra: nhắn agent *"chạy whoami Figma MCP"*

## Prompt mẫu (sau khi auth)

```text
Lấy design từ Figma MCP cho file 5ovQZG71O7DI3viL9nLX3v, node 2:830.
Chạy get_design_context và get_screenshot, rồi cập nhật aistudyhub-fe cho khớp Figma.
Dùng Tailwind và component sẵn có (AuthSplitLayout, DashboardShell).
```

## Auth screens (node 96:741)

Login / Register đã map qua `AuthSplitLayout` + ảnh `src/assets/illustrations/login-illustration.png`, `register-illustration.png`.

## Rate limit

Gói Figma Starter / seat View: ~6 lần gọi tool MCP/tháng. Dev/Full seat: giới hạn theo phút.
