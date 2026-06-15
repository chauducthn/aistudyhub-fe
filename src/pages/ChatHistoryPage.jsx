import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot,
  FileText,
  Loader2,
  MessageSquare,
  Trash2,
  User as UserIcon,
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import ChatMarkdown from '../components/ChatMarkdown'
import { clearChatHistory, getChatHistory } from '../api/chatbotApi'
import { getApiErrorMessage } from '../utils/apiError'

const PAGE_SIZE = 20

function dayBucket(iso) {
  if (!iso) return 'Earlier'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Earlier'
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((startOfToday - startOfDate) / 86400000)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: 'long' })
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

/** Gom các record (đã sort DESC) thành nhóm theo ngày, giữ thứ tự mới -> cũ. */
function groupByDay(records) {
  const groups = []
  let current = null
  records.forEach((rec) => {
    const label = dayBucket(rec.createdAt)
    if (!current || current.label !== label) {
      current = { label, items: [] }
      groups.push(current)
    }
    current.items.push(rec)
  })
  return groups
}

export default function ChatHistoryPage() {
  const [records, setRecords] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    let ignore = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await getChatHistory({ page, size: PAGE_SIZE })
        if (ignore) return
        if (!res.success) throw new Error(res.message || 'Could not load chat history.')
        setRecords(res.data.content || [])
        setTotalPages(res.data.totalPages ?? 0)
        setTotalElements(res.data.totalElements ?? 0)
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, 'Could not load chat history.'))
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => {
      ignore = true
    }
  }, [page])

  const handleClear = async () => {
    setClearing(true)
    setError('')
    try {
      const res = await clearChatHistory()
      if (!res.success) throw new Error(res.message)
      setRecords([])
      setTotalElements(0)
      setTotalPages(0)
      setPage(0)
      setConfirmClear(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not clear history.'))
    } finally {
      setClearing(false)
    }
  }

  const groups = groupByDay(records)

  return (
    <DashboardShell>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b1c30] sm:text-4xl">Chat History</h1>
            <p className="mt-2 text-base text-[#464555]">
              {loading
                ? 'Loading...'
                : `${totalElements} conversation${totalElements === 1 ? '' : 's'} with your study assistant.`}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/chatbot"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(53,37,205,0.25)] transition hover:bg-[#2d1fb0]"
            >
              <MessageSquare className="h-4 w-4" />
              New Chat
            </Link>
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              disabled={clearing || records.length === 0}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#c7c4d8]/40 bg-white px-4 text-sm font-bold text-[#464555] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Clear All
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="mt-8 grid place-items-center rounded-2xl border border-[#c7c4d8]/25 bg-white px-6 py-20 text-center shadow-sm">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#e8e3ff] text-[#3525cd]">
              <MessageSquare className="h-8 w-8" />
            </span>
            <h2 className="mt-5 text-xl font-extrabold text-[#0b1c30]">No conversations yet</h2>
            <p className="mt-2 max-w-md text-sm text-[#464555]">
              Start chatting with the study assistant and your past conversations will appear here.
            </p>
            <Link
              to="/chatbot"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white transition hover:bg-[#2d1fb0]"
            >
              <MessageSquare className="h-4 w-4" />
              Start a chat
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {groups.map((group) => (
              <section key={group.label}>
                <h2 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-[#74798a]">
                  {group.label}
                </h2>
                <div className="space-y-3">
                  {group.items.map((rec) => (
                    <ConversationCard key={rec.id} record={rec} />
                  ))}
                </div>
              </section>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#c7c4d8]/20 pt-4">
                <span className="text-xs font-bold text-[#74798a]">
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 0 || loading}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="inline-flex h-9 items-center rounded-lg border border-[#c7c4d8]/40 bg-white px-4 text-sm font-bold text-[#0b1c30] transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page + 1 >= totalPages || loading}
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex h-9 items-center rounded-lg border border-[#c7c4d8]/40 bg-white px-4 text-sm font-bold text-[#0b1c30] transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {confirmClear && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#0b1c30]/40 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal
          onClick={() => !clearing && setConfirmClear(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_60px_rgba(11,28,48,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-xl font-extrabold text-[#0b1c30]">Clear chat history?</h2>
              <p className="mt-2 text-sm text-[#464555]">
                This hides all your past conversations from view. You can always start a new chat.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                disabled={clearing}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#c7c4d8]/40 bg-white text-sm font-bold text-[#0b1c30] transition hover:bg-[#eff4ff] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={clearing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {clearing && <Loader2 className="h-4 w-4 animate-spin" />}
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}

function ConversationCard({ record }) {
  return (
    <article className="rounded-2xl border border-[#c7c4d8]/25 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#74798a]">
          {formatTime(record.createdAt)}
          {record.documentTitle && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#dce9ff] px-2 py-0.5 font-bold text-[#3525cd]">
              <FileText className="h-3 w-3" />
              {record.documentTitle}
            </span>
          )}
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-start gap-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#3525cd] text-white">
            <UserIcon className="h-4 w-4" />
          </span>
          <p className="rounded-2xl rounded-tl-sm bg-[#eef0ff] px-3.5 py-2 text-sm font-medium leading-6 text-[#0b1c30]">
            {record.message}
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8e3ff] text-[#3525cd]">
            <Bot className="h-4 w-4" />
          </span>
          <div className="rounded-2xl rounded-tl-sm bg-[#f8f9ff] px-3.5 py-2 text-sm leading-6 text-[#464555]">
            <ChatMarkdown>{record.response}</ChatMarkdown>
          </div>
        </div>
      </div>
    </article>
  )
}
