import { Bot } from 'lucide-react'

function Dot({ delay = '0ms' }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-[#3525cd]"
      style={{ animationDelay: delay }}
    />
  )
}

export default function ThinkingIndicator() {
  return (
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
  )
}
