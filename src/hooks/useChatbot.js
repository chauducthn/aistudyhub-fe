import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  clearChatHistory,
  getChatHistory,
  listChatContextDocuments,
  sendChatMessage,
} from '../api/chatbotApi'
import { expandToBubbles, recordsToBubbles } from '../utils/chatBubbles'
import { getApiErrorMessage } from '../utils/apiError'

export function useChatbot() {
  const [searchParams] = useSearchParams()
  const [bubbles, setBubbles] = useState([])
  const [input, setInput] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [documents, setDocuments] = useState([])
  const [sending, setSending] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [])

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const [historyRes, docsRes] = await Promise.all([
          getChatHistory({ page: 0, size: 50 }),
          listChatContextDocuments(),
        ])
        if (ignore) return
        if (historyRes.success) {
          setBubbles(recordsToBubbles(historyRes.data.content || []))
        }
        if (docsRes.success) setDocuments(docsRes.data || [])
        const preselect = searchParams.get('doc')
        if (preselect && docsRes.success) {
          const exists = (docsRes.data || []).some((d) => String(d.id) === String(preselect))
          if (exists) setDocumentId(String(preselect))
        }
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, 'Could not load chat history.'))
      } finally {
        if (!ignore) setLoadingHistory(false)
      }
    })()
    return () => {
      ignore = true
    }
  }, [searchParams])

  useEffect(() => {
    scrollToBottom()
  }, [bubbles, sending, scrollToBottom])

  const send = async (event) => {
    event?.preventDefault?.()
    const text = input.trim()
    if (!text || sending) return

    setError('')
    setSending(true)
    setInput('')
    const tempKey = `temp-${bubbles.length}`
    setBubbles((prev) => [...prev, { key: tempKey, role: 'user', text, at: new Date().toISOString() }])

    try {
      const res = await sendChatMessage({ message: text, documentId: documentId || undefined })
      if (!res.success || !res.data) throw new Error(res.message || 'No response from assistant.')
      setBubbles((prev) => [
        ...prev.filter((b) => b.key !== tempKey),
        ...expandToBubbles(res.data),
      ])
    } catch (err) {
      setBubbles((prev) => prev.filter((b) => b.key !== tempKey))
      setInput(text)
      const msg = getApiErrorMessage(err, 'Could not send message.')
      if (msg.toLowerCase().includes('permission') || msg.includes('403')) {
        setError('You cannot chat with this private document. Pick your own file or a public document.')
      } else {
        setError(msg)
      }
    } finally {
      setSending(false)
    }
  }

  const clear = async () => {
    if (clearing || bubbles.length === 0) return
    setClearing(true)
    setError('')
    try {
      const res = await clearChatHistory()
      if (!res.success) throw new Error(res.message)
      setBubbles([])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not clear history.'))
    } finally {
      setClearing(false)
    }
  }

  return {
    bubbles,
    input,
    setInput,
    documentId,
    setDocumentId,
    documents,
    sending,
    loadingHistory,
    clearing,
    error,
    scrollRef,
    send,
    clear,
  }
}
