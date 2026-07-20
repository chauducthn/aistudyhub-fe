import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  clearChatHistory,
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
  const sendingRef = useRef(false)
  const activeSessionRef = useRef(null)
  const sessionLoadRequestRef = useRef(0)

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
    } catch {
      // Keep the current sidebar state when a background refresh fails.
    }
  }, [])

  const selectSession = async (id) => {
    const normalizedId = String(id)
    const requestId = ++sessionLoadRequestRef.current
    activeSessionRef.current = normalizedId
    setCurrentSessionId(normalizedId)
    setLoadingHistory(true)
    setError('')
    try {
      const res = await getSessionMessages(id, { page: 0, size: 100 })
      if (requestId === sessionLoadRequestRef.current && res.success) {
        setBubbles(recordsToBubbles(res.data.content || []))
      }
    } catch (err) {
      if (requestId === sessionLoadRequestRef.current) {
        setError(getApiErrorMessage(err, 'Could not load session messages.'))
      }
    } finally {
      if (requestId === sessionLoadRequestRef.current) setLoadingHistory(false)
    }
  }

  const createNewSession = () => {
    sessionLoadRequestRef.current += 1
    activeSessionRef.current = null
    setCurrentSessionId(null)
    setBubbles([])
    setLoadingHistory(false)
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
    if (!text || sendingRef.current) return

    sendingRef.current = true
    setError('')
    setSending(true)
    setInput('')
    const targetSessionId = activeSessionRef.current
    const tempKey = `temp-${Date.now()}`
    setBubbles((prev) => [...prev, { key: tempKey, role: 'user', text, at: new Date().toISOString() }])

    try {
      const res = await sendChatMessage({
        message: text,
        documentId: documentId || undefined,
        sessionId: targetSessionId || undefined,
      })
      if (!res.success || !res.data) throw new Error(res.message || 'No response from assistant.')

      if (activeSessionRef.current === targetSessionId) {
        setBubbles((prev) => [
          ...prev.filter((b) => b.key !== tempKey),
          ...expandToBubbles(res.data),
        ])

        if (!targetSessionId && res.data.sessionId) {
          const createdSessionId = String(res.data.sessionId)
          activeSessionRef.current = createdSessionId
          setCurrentSessionId(createdSessionId)
        }
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
      sendingRef.current = false
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
