import { Bot } from 'lucide-react'

export default function ChatBubble({ bubble, initials }) {
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
