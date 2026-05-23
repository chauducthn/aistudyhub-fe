export function getApiErrorMessage(err, fallback = 'Có lỗi xảy ra.') {
  if (!err.response) {
    if (err.message?.includes('502') || err.code === 'ERR_BAD_RESPONSE') {
      return (
        'Backend chưa chạy hoặc không phản hồi (lỗi 502). ' +
        'Mở terminal và chạy: cd aistudyhub-be → .\\mvnw.cmd spring-boot:run ' +
        '(đợi đến khi thấy "Started").'
      )
    }
    return 'Không kết nối được API. Kiểm tra backend tại http://localhost:8080/api/health'
  }

  if (err.response.status === 502) {
    return (
      'Backend chưa chạy (502). Chạy Spring Boot trên cổng 8080 trước khi đăng ký/đăng nhập.'
    )
  }

  return err.response?.data?.message || err.message || fallback
}
