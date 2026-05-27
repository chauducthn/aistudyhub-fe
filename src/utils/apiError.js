export function getApiErrorMessage(err, fallback = 'Có lỗi xảy ra.') {
  if (!err.response) {
    if (err.message?.includes('502') || err.code === 'ERR_BAD_RESPONSE') {
      return (
        'Backend chưa chạy hoặc không phản hồi (lỗi 502). ' +
        'Mở terminal và chạy: cd aistudyhub-be → .\\mvnw.cmd spring-boot:run ' +
        '(đợi đến khi thấy "Started").'
      )
    }
    return 'Không kết nối được API. Kiểm tra backend tại http://localhost:8081/api/health'
  }

  if (err.response.status === 502) {
    return (
      'Backend chưa chạy (502). Chạy Spring Boot trên cổng 8081 (aistudyhub-be\\run-dev.ps1) trước khi đăng ký/đăng nhập.'
    )
  }

  if (err.response.status === 403) {
    const msg = err.response?.data?.message
    if (msg?.toLowerCase().includes('locked')) {
      return 'Tài khoản tạm khóa do nhập sai mật khẩu nhiều lần. Đợi 15 phút hoặc dùng Forgot password / admin mở khóa.'
    }
    return msg || 'Tài khoản bị khóa hoặc không có quyền truy cập.'
  }

  return err.response?.data?.message || err.message || fallback
}
