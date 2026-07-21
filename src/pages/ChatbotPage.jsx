import { AlertTriangle, Loader2, MessageSquare, Plus, Trash2 } from 'lucide-react'
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
      <div className="flex h-[calc(100vh-65px)] overflow-hidden">
        <aside className="hidden w-72 flex-col bg-[#0b1329] text-slate-100 md:flex border-r border-[#1a2542]">
          <div className="p-4 border-b border-[#1a2542]">
            <button
              type="button"
              onClick={chat.createNewSession}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/40 py-2.5 text-sm font-bold text-slate-100 transition hover:bg-slate-800 hover:border-slate-600"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
            {chat.sessions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-semibold">
                No chat history found
              </div>
            ) : (
              chat.sessions.map((sess) => {
                const isActive = String(chat.currentSessionId) === String(sess.id)
                return (
                  <div
                    key={sess.id}
                    onClick={() => chat.selectSession(sess.id)}
                    className={`group flex items-center justify-between rounded-xl px-3 py-3 text-sm cursor-pointer transition ${
                      isActive
                        ? 'bg-[#1a233d] text-white font-bold'
                        : 'text-slate-400 hover:bg-[#121b34] hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                      <span className="truncate">{sess.title || 'Untitled Session'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => chat.handleDeleteSession(sess.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-500 rounded transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          <div className="p-4 border-t border-[#1a2542] bg-[#070d1e] flex items-center justify-center">
            <button
              type="button"
              onClick={chat.clear}
              className="text-xs font-semibold text-slate-500 hover:text-red-400 transition"
            >
              Clear All
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col bg-slate-50 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-[#0b1c30]">AI Study Assistant</h1>
              <p className="text-xs text-slate-500">
                Ask questions about your documents using external web knowledge and OCR scan fallback.
              </p>
            </div>
            <button
              type="button"
              onClick={chat.createNewSession}
              className="md:hidden flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
            >
              <Plus className="h-3.5 w-3.5" />
              New Chat
            </button>
          </div>

          {chat.error && (
            <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {chat.error}
            </div>
          )}

          <div className="flex-1 min-h-0 flex flex-col m-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md">
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
      </div>
    </DashboardShell>
  )
}
