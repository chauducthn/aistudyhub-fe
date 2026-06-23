import { Bot, Loader2 } from 'lucide-react'
import ChatBubble from './ChatBubble'
import ThinkingIndicator from './ThinkingIndicator'

export default function ChatMessageList({
  bubbles,
  loadingHistory,
  sending,
  initials,
  scrollRef,
}) {
  return (
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
              Chat không cần tài liệu, hoặc chọn file đã extract text để AI đọc nội dung qua RAG.
            </p>
          </div>
        </div>
      ) : (
        bubbles.map((b) => <ChatBubble key={b.key} bubble={b} initials={initials} />)
      )}
      {sending && <ThinkingIndicator />}
    </div>
  )
}
