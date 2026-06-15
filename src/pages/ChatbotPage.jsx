import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertTriangle, Bot, FileText, Loader2, Send, Trash2 } from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import ExtractionStatusBadge from '../components/documents/ExtractionStatusBadge'
import { useAuth } from '../context/useAuth'
import {
  clearChatHistory,
  getChatHistory,
  listChatContextDocuments,
  sendChatMessage,
} from '../api/chatbotApi'
import { extractionStatusMeta, isChatReady } from '../utils/extractionStatus'
import { getApiErrorMessage } from '../utils/apiError'

function expandToBubbles(record) {
  const bubbles = []
  if (record.message) {
    bubbles.push({
      key: `${record.id}-u`,
      role: 'user',
      text: record.message,
      at: record.createdAt,
    })
  }
  if (record.response) {
    bubbles.push({
      key: `${record.id}-b`,
      role: 'bot',
      text: record.response,
      at: record.createdAt,
      documentTitle: record.documentTitle,
      model: record.model,
    })
  }
  return bubbles
}

export default function ChatbotPage() {
  const { user } = useAuth()
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
  const initials = (user?.fullName || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

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
          const records = [...(historyRes.data.content || [])].reverse()
          setBubbles(records.flatMap(expandToBubbles))
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

  const handleSend = async (event) => {
    event.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setError('')
    setSending(true)
    setInput('')

    const tempKey = `temp-${bubbles.length}`
    setBubbles((prev) => [
      ...prev,
      { key: tempKey, role: 'user', text, at: new Date().toISOString() },
    ])

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

  const handleClear = async () => {
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

  const selectedDoc = documents.find((d) => String(d.id) === String(documentId))
  const selectedMeta = selectedDoc ? extractionStatusMeta(selectedDoc.extractionStatus) : null

  return (
    <DashboardShell>
      <div className="flex h-[calc(100vh-65px)] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0b1c30] sm:text-3xl">AI Study Assistant</h1>
            <p className="mt-1 text-sm text-[#464555]">
              Gửi câu hỏi qua <code className="rounded bg-[#eff4ff] px-1 text-xs">POST /api/chatbot/messages</code> — phản hồi thật từ backend (Gemini hoặc local fallback).
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={clearing || bubbles.length === 0}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#c7c4d8]/40 bg-white px-4 text-sm font-bold text-[#464555] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Clear History
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#c7c4d8]/25 bg-white shadow-sm">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-6">
            {loadingHistory ? (
              <div className="grid h-full place-items-center">
                <Loader2 className="h-7 w-7 animate-spin text-[#3525cd]" />
              </div>
            ) : bubbles.length === 0 ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e8e3ff] text-[#3525cd]">
                    <Bot className="h-7 w-7" />
                  </span>
                  <h2 className="mt-5 text-lg font-extrabold text-[#0b1c30]">Start a conversation</h2>
                  <p className="mt-2 max-w-sm text-sm text-[#74798a]">
                    Chat không cần tài liệu, hoặc chọn file đã extract text để AI đọc nội dung.
                  </p>
                </div>
              </div>
            ) : (
              bubbles.map((b) => <ChatBubble key={b.key} bubble={b} initials={initials} />)
            )}

            {sending && (
              <div className="flex items-end gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8e3ff] text-[#3525cd]">
                  <Bot className="h-5 w-5" />
                </span>
                <div className="rounded-2xl rounded-bl-sm bg-[#f1f3fb] px-4 py-3">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[#74798a]">
                    <span className="flex gap-1">
                      <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
                    </span>
                    Assistant is thinking...
                  </span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="border-t border-[#c7c4d8]/20 bg-[#f8f9ff] px-4 py-3 sm:px-6">
            <div className="mb-2.5 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#74798a]">
                <FileText className="h-3.5 w-3.5" />
                Document context:
              </span>
              {documents.length > 0 ? (
                <>
                  <select
                    id="chat-doc"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    className="max-w-xs rounded-lg border border-[#c7c4d8]/50 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0b1c30] outline-none focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/15"
                  >
                    <option value="">No document (general help)</option>
                    {documents.map((d) => (
                      <option
                        key={d.id}
                        value={d.id}
                        disabled={d.extractionStatus === 'FAILED'}
                      >
                        {d.title} [{d.extractionStatus || 'PENDING'}]
                        {d.source === 'public' ? ' · public' : ''}
                        {d.extractionStatus === 'FAILED' ? ' · unavailable' : ''}
                      </option>
                    ))}
                  </select>
                  {selectedDoc ? (
                    <span className="inline-flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#e8e3ff] px-2 py-1 font-bold text-[#3525cd]">
                        {selectedDoc.source === 'public' ? 'Public:' : 'Mine:'} {selectedDoc.title}
                      </span>
                      <ExtractionStatusBadge status={selectedDoc.extractionStatus} />
                      {!isChatReady(selectedDoc.extractionStatus) && (
                        <span className="text-[#74798a]" title={selectedMeta?.hint}>
                          Limited context until extraction completes.
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[#74798a]">Own docs + public docs you can access.</span>
                  )}
                </>
              ) : (
                <span className="text-[#74798a]">
                  No documents yet —{' '}
                  <Link to="/upload" className="font-bold text-[#3525cd] hover:underline">
                    upload one
                  </Link>{' '}
                  or browse{' '}
                  <Link to="/public-documents" className="font-bold text-[#3525cd] hover:underline">
                    public documents
                  </Link>
                  .
                </span>
              )}
            </div>
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(e)
                  }
                }}
                rows={1}
                placeholder="Ask AI anything... (Enter to send, Shift+Enter for newline)"
                className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-[#c7c4d8]/40 bg-white px-4 py-2.5 text-sm text-[#0b1c30] outline-none focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/15"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white transition hover:bg-[#2d1fb0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  )
}

function ChatBubble({ bubble, initials }) {
  const isUser = bubble.role === 'user'
  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
          isUser ? 'bg-[#3525cd] text-white' : 'bg-[#e8e3ff] text-[#3525cd]'
        }`}
      >
        {isUser ? initials : <Bot className="h-5 w-5" />}
      </span>
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
            isUser
              ? 'rounded-br-sm bg-[#3525cd] text-white'
              : 'rounded-bl-sm bg-[#f1f3fb] text-[#0b1c30]'
          }`}
        >
          {bubble.text}
        </div>
        {!isUser && bubble.model && (
          <p className="mt-1 px-1 text-[10px] font-semibold text-[#74798a]">Model: {bubble.model}</p>
        )}
        {bubble.documentTitle && (
          <p className="mt-1 px-1 text-[11px] font-semibold text-[#74798a]">
            Based on: {bubble.documentTitle}
          </p>
        )}
      </div>
    </div>
  )
}

function Dot({ delay = '0ms' }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-[#3525cd]"
      style={{ animationDelay: delay }}
    />
  )
}
