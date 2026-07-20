export function getApiErrorMessage(err, fallback = 'An unexpected error occurred.') {
  if (!err.response) {
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.message?.toLowerCase().includes('timeout')) {
      return 'API request timed out. Please try again.'
    }
    if (err.message?.includes('502') || err.code === 'ERR_BAD_RESPONSE') {
      return (
        'Backend service is not running or not responding (502 Bad Gateway). ' +
        'Please start the backend server and wait until it is fully loaded.'
      )
    }
    return 'Could not connect to the API server. Please check if the backend is running and healthy.'
  }

  if (err.response.status === 502) {
    return err.response?.data?.message || 'AI Gateway / Proxy service returned 502 Bad Gateway. Check AI provider settings.'
  }

  if (err.response.status === 403) {
    const msg = err.response?.data?.message
    if (msg?.toLowerCase().includes('locked')) {
      return 'Account temporarily locked due to multiple failed login attempts. Please wait 15 minutes or contact support.'
    }
    return msg || 'Access denied: You do not have permission to perform this action.'
  }

  return err.response?.data?.message || err.message || fallback
}
