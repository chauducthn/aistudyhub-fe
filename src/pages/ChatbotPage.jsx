import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import ChatComposer from '../components/chatbot/ChatComposer'
import ChatMessageList from '../components/chatbot/ChatMessageList'
import { useAuth } from '../context/useAuth'
import { useChatbot } from '../hooks/useChatbot'

export default function ChatbotPage() {
  const { user } = useAuth()
  const chat = useChatbot()
  const initials = (user?.fullName || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <DashboardShell>
      <div className="flex h-[calc(100vh-65px)] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0b1c30] sm:text-3xl">AI Study Assistant</h1>
            <p className="mt-1 text-sm text-[#464555]">
              Ask questions about your study materials. Bot replies support Markdown, code blocks, and citations.
            </p>
          </div>
          <button
            type="button"
            onClick={chat.clear}
            disabled={chat.clearing || chat.bubbles.length === 0}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#c7c4d8]/40 bg-white px-4 text-sm font-bold text-[#464555] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {chat.clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Clear History
          </button>
        </div>

        {chat.error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {chat.error}
          </div>
        )}

        <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#c7c4d8]/25 bg-white shadow-sm">
          <ChatMessageList
            bubbles={chat.bubbles}
            loadingHistory={chat.loadingHistory}
            sending={chat.sending}
            initials={initials}
            scrollRef={chat.scrollRef}
          />
          <ChatComposer
            input={chat.input}
            onInputChange={chat.setInput}
            onSubmit={chat.send}
            sending={chat.sending}
            documents={chat.documents}
            documentId={chat.documentId}
            onDocumentIdChange={chat.setDocumentId}
          />
        </div>
      </div>
    </DashboardShell>
  )
}
