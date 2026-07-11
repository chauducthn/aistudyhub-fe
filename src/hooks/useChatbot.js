import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  clearChatHistory,
  getChatHistory,
  listChatContextDocuments,
  sendChatMessage,
  getChatSessions,
  getSessionMessages,
  deleteChatSession,
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

  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [])

  const loadSessions = useCallback(async () => {
    try {
      const res = await getChatSessions()
      if (res.success) {
        setSessions(res.data || [])
      }
    } catch (err) {
    }
  }, [])

  const selectSession = async (id) => {
    setCurrentSessionId(id)
    setLoadingHistory(true)
    setError('')
    try {
      const res = await getSessionMessages(id, { page: 0, size: 100 })
      if (res.success) {
        setBubbles(recordsToBubbles(res.data.content || []))
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load session messages.'))
    } finally {
      setLoadingHistory(false)
    }
  }

  const createNewSession = () => {
    setCurrentSessionId(null)
    setBubbles([])
  }

  const handleDeleteSession = async (id, event) => {
    event?.stopPropagation?.()
    try {
      await deleteChatSession(id)
      loadSessions()
      if (String(currentSessionId) === String(id)) {
        createNewSession()
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not delete session.'))
    }
  }

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const [docsRes] = await Promise.all([
          listChatContextDocuments(),
          loadSessions(),
        ])
        if (ignore) return

        if (docsRes.success) setDocuments(docsRes.data || [])
        const preselect = searchParams.get('doc')
        if (preselect && docsRes.success) {
          const exists = (docsRes.data || []).some((d) => String(d.id) === String(preselect))
          if (exists) setDocumentId(String(preselect))
        }
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, 'Could not load chat data.'))
      } finally {
        if (!ignore) setLoadingHistory(false)
      }
    })()
    return () => {
      ignore = true
    }
  }, [searchParams, loadSessions])

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
      const res = await sendChatMessage({
        message: text,
        documentId: documentId || undefined,
        sessionId: currentSessionId || undefined,
      })
      if (!res.success || !res.data) throw new Error(res.message || 'No response from assistant.')
      
      setBubbles((prev) => [
        ...prev.filter((b) => b.key !== tempKey),
        ...expandToBubbles(res.data),
      ])

      if (!currentSessionId && res.data.sessionId) {
        setCurrentSessionId(String(res.data.sessionId))
      }
      loadSessions()
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
      createNewSession()
      loadSessions()
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
    sessions,
    currentSessionId,
    selectSession,
    createNewSession,
    handleDeleteSession,
  }
}
