import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, FileText, Loader2, Plus, Send } from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import { useAuth } from '../context/useAuth'
import { sendChatMessage } from '../api/chatbotApi'
import { getApiErrorMessage } from '../utils/apiError'

const docs = [
  { name: 'Quantum_Physics_Vol4.pdf', meta: '4.2MB • PDF', subject: 'Physics', subjectClass: 'bg-[#e8e3ff] text-[#3525cd]', date: 'Oct 24', type: 'pdf' },
  { name: 'Machine_Learning_Intro.docx', meta: '1.1MB • DOCX', subject: 'AI', subjectClass: 'bg-[#d6f7fb] text-[#00687a]', date: 'Oct 22', type: 'doc' },
  { name: 'Neural_Architecture_2024.pdf', meta: '2.8MB • PDF', subject: 'AI', subjectClass: 'bg-[#d6f7fb] text-[#00687a]', date: 'Oct 20', type: 'pdf' },
  { name: 'Database_Normalization_Patterns.docx', meta: '1.5MB • DOCX', subject: 'Database', subjectClass: 'bg-[#dce9ff] text-[#3525cd]', date: 'Oct 18', type: 'doc' },
  { name: 'Thermodynamics_Lab_Report.pdf', meta: '3.1MB • PDF', subject: 'Physics', subjectClass: 'bg-[#e8e3ff] text-[#3525cd]', date: 'Oct 15', type: 'pdf' },
]

const subjects = [
  { name: 'Software Engineering', count: 42 },
  { name: 'Database Systems', count: 28 },
  { name: 'Artificial Intelligence', count: 56 },
]

export default function UserDashboardPage() {
  const { user } = useAuth()
  const firstName = user?.fullName?.split(' ')[0] || 'Alex'

  return (
    <DashboardShell>
      <div className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b1c30] sm:text-4xl">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#464555]">
              Manage your study documents and continue learning with your AI assistant.
              You have <span className="font-bold text-[#3525cd]">3 documents</span> waiting for review.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#3525cd] px-8 text-base font-bold text-white shadow-[0_12px_28px_rgba(53,37,205,0.3)]"
          >
            <Plus className="h-5 w-5" aria-hidden />
            Upload New Document
          </button>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(220px,1.4fr)]">
          <StatCard title="Total Documents" value="1,248" badge="+12 new" />
          <StatCard title="Active Subjects" value="14" />
          <StatCard title="AI Chat Sessions" value="84" />
          <StatCard title="Recent Downloads" value="3" />
          <article className="rounded-2xl border border-[#c7c4d8]/20 bg-white p-6 shadow-sm sm:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0b1c30]">Storage Used</h3>
              <span className="text-sm font-semibold text-[#464555]">12.4GB / 50GB</span>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#eff4ff]">
              <div className="h-full w-[25%] rounded-full bg-[#3525cd]" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-[#464555]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#3525cd]" /> PDF 60%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#57dffe]" /> DOCX 20%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#571ac0]" /> PPTX 15%
              </span>
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <article className="overflow-hidden rounded-2xl border border-[#c7c4d8]/20 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#c7c4d8]/20 px-6 py-4">
              <h2 className="text-lg font-extrabold text-[#0b1c30]">Recent Documents</h2>
              <button type="button" className="text-sm font-bold text-[#3525cd]">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-[#eff4ff] text-xs font-bold uppercase tracking-wide text-[#74798a]">
                  <tr>
                    <th className="px-6 py-3">Document Name</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => (
                    <tr key={doc.name} className="border-t border-[#c7c4d8]/15">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                              doc.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            <FileText className="h-4 w-4" aria-hidden />
                          </span>
                          <div>
                            <div className="font-semibold text-[#0b1c30]">{doc.name}</div>
                            <div className="text-xs text-[#74798a]">{doc.meta}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${doc.subjectClass}`}>
                          {doc.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#74798a]">{doc.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="space-y-4">
            <StudyAssistantWidget />

            <article className="rounded-2xl border border-[#c7c4d8]/20 bg-white p-5 shadow-sm">
              <div className="flex justify-between text-sm font-extrabold text-[#0b1c30]">
                <span>Uploading...</span>
                <span className="text-[#3525cd]">75%</span>
              </div>
              <p className="mt-2 text-xs text-[#74798a]">Neural_Networks_Thesis.pdf</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eff4ff]">
                <div className="h-full w-3/4 rounded-full bg-[#3525cd]" />
              </div>
            </article>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#0b1c30]">Subject Overview</h2>
            <button type="button" className="text-sm font-bold text-[#3525cd]">
              Manage Subjects
            </button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {subjects.map((subject) => (
              <article
                key={subject.name}
                className="rounded-2xl border border-[#c7c4d8]/20 bg-white p-6 shadow-sm"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e8e3ff] text-[#3525cd]">
                  <FileText className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-5 font-bold text-[#0b1c30]">{subject.name}</h3>
                <p className="mt-1 text-sm text-[#74798a]">{subject.count} documents uploaded</p>
                <div className="mt-4 flex -space-x-2">
                  {['AC', 'JD', 'MK'].map((initial) => (
                    <span
                      key={initial}
                      className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#3525cd] text-[10px] font-bold text-white"
                    >
                      {initial}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <button
          type="button"
          className="fixed bottom-8 right-8 grid h-14 w-14 place-items-center rounded-full bg-[#3525cd] text-white shadow-[0_12px_28px_rgba(53,37,205,0.4)] lg:right-10"
          aria-label="Quick add"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </DashboardShell>
  )
}

function StudyAssistantWidget() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = scrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }

  const send = async (text) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed || sending) return

    setError('')
    setSending(true)
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    scrollToBottom()

    try {
      const res = await sendChatMessage({ message: trimmed })
      if (!res.success || !res.data) throw new Error(res.message || 'No response.')
      setMessages((prev) => [...prev, { role: 'bot', text: res.data.response }])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reach the assistant.'))
    } finally {
      setSending(false)
      scrollToBottom()
    }
  }

  return (
    <article className="rounded-2xl border-2 border-[#57dffe]/40 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-[#0b1c30]">Study Assistant</h3>
        <Link to="/chatbot" className="text-xs font-bold text-[#3525cd] hover:underline">
          Open full chat
        </Link>
      </div>

      <div
        ref={scrollRef}
        className="mt-4 max-h-64 min-h-[120px] space-y-3 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-[#c7c4d8]/25 bg-[#f8f9ff] px-4 py-3 text-sm leading-6 text-[#464555]">
            Hi {`👋`} Ask me to summarize a topic, explain a concept, or create a quiz to get started.
          </div>
        ) : (
          messages.map((m, idx) =>
            m.role === 'user' ? (
              <div
                key={idx}
                className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#3525cd] px-4 py-3 text-sm font-medium text-white"
              >
                {m.text}
              </div>
            ) : (
              <div
                key={idx}
                className="flex max-w-[90%] gap-2 rounded-2xl rounded-tl-sm border border-[#c7c4d8]/25 bg-[#f8f9ff] px-3 py-3 text-sm leading-6 text-[#464555]"
              >
                <Bot className="mt-0.5 h-4 w-4 shrink-0 text-[#3525cd]" />
                <span className="whitespace-pre-wrap">{m.text}</span>
              </div>
            ),
          )
        )}
        {sending && (
          <div className="flex items-center gap-2 text-xs font-semibold text-[#74798a]">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#3525cd]" />
            Assistant is thinking...
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {['Summarize a topic', 'Explain a concept', 'Create a quiz'].map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => send(chip)}
            disabled={sending}
            className="rounded-full bg-[#d6f7fb] px-3 py-1.5 text-xs font-bold text-[#00687a] transition hover:bg-[#bdeef6] disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
        className="mt-4 flex h-11 items-center gap-2 rounded-xl bg-[#eff4ff] px-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI anything..."
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#74798a]"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#3525cd] text-white transition hover:bg-[#2d1fb0] disabled:opacity-50"
          aria-label="Send"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </article>
  )
}

function StatCard({ title, value, badge }) {
  return (
    <article className="rounded-2xl border border-[#c7c4d8]/20 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8e3ff] text-[#3525cd]">
          <FileText className="h-5 w-5" aria-hidden />
        </span>
        {badge && (
          <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-5 text-2xl font-extrabold text-[#0b1c30]">{value}</div>
      <div className="mt-0.5 text-sm font-semibold text-[#464555]">{title}</div>
    </article>
  )
}
