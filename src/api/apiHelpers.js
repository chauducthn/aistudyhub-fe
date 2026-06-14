/** Chuẩn hóa response ApiResponse<T> từ backend. */
export function unwrapApiResponse(axiosData) {
  return {
    success: axiosData?.success !== false,
    message: axiosData?.message ?? null,
    data: axiosData?.data ?? null,
  }
}

/** Chuẩn hóa PageResponse<T> sau khi unwrap. */
export function mapPageResponse(pageData, mapItem = (item) => item) {
  const content = (pageData?.content || []).map(mapItem)
  return {
    content,
    page: pageData?.page ?? 0,
    size: pageData?.size ?? content.length,
    totalElements: pageData?.totalElements ?? content.length,
    totalPages: pageData?.totalPages ?? 1,
  }
}
