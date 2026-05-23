import DashboardShell from '../components/DashboardShell'
import { useAuth } from '../context/useAuth'

const docs = [
  ['Quantum_Physics_Vol4.pdf', '4.2MB • PDF', 'Physics', 'Oct 24'],
  ['Machine_Learning_Intro.docx', '1.1MB • DOCX', 'AI', 'Oct 22'],
  ['Neural_Architecture_2024.pdf', '2.8MB • PDF', 'AI', 'Oct 20'],
  ['Database_Normalization_Patterns.docx', '1.5MB • DOCX', 'Database', 'Oct 18'],
  ['Thermodynamics_Lab_Report.pdf', '3.1MB • PDF', 'Physics', 'Oct 15'],
]

export default function UserDashboardPage() {
  const { user } = useAuth()
  const firstName = user?.fullName?.split(' ')[0] || 'Alex'

  return (
    <DashboardShell>
      <div className="px-8 py-10 lg:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <h1 className="text-4xl font-extrabold">Welcome back, {firstName}!</h1>
            <p className="mt-4 max-w-3xl text-xl font-semibold leading-8 text-[#4f5668]">
              Manage your study documents and continue learning with your AI assistant.
              <br />
              You have 3 documents waiting for review.
            </p>
          </div>
          <button className="h-24 rounded-2xl bg-[#3b2be0] px-12 text-xl font-bold text-white shadow-[0_18px_35px_rgba(59,43,224,0.35)]">
            + Upload New
            <br />
            Document
          </button>
        </div>

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-[repeat(4,1fr)_2fr]">
          <Stat title="Total Documents" value="1,248" badge="+12 new" />
          <Stat title="Active Subjects" value="14" />
          <Stat title="AI Chat Sessions" value="84" />
          <Stat title="Recent Downloads" value="3" />
          <article className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex justify-between">
              <h3 className="font-extrabold">Storage Used</h3>
              <span>12.4GB / 50GB</span>
            </div>
            <div className="mt-6 h-3 rounded-full bg-[#dfe8ff]">
              <div className="h-3 w-[32%] rounded-full bg-[#3b2be0]" />
            </div>
            <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold">
              <span>PDF 60%</span>
              <span>DOCX 20%</span>
              <span>PPTX 15%</span>
            </div>
          </article>
        </section>

        <section className="mt-10 grid gap-8 xl:grid-cols-[2fr_1fr]">
          <article className="rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between px-8 py-7">
              <h2 className="text-2xl font-extrabold">Recent Documents</h2>
              <button className="font-bold text-[#3427d9]">View All</button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-[#eef4ff] text-sm font-extrabold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-8 py-4">Document Name</th>
                  <th className="px-4 py-4">Subject</th>
                  <th className="px-8 py-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(([name, meta, subject, date]) => (
                  <tr key={name} className="border-t border-slate-100">
                    <td className="px-8 py-5">
                      <div className="font-semibold">{name}</div>
                      <div className="text-sm text-slate-500">{meta}</div>
                    </td>
                    <td className="px-4 py-5">
                      <span className="rounded-md bg-cyan-100 px-3 py-1 text-sm font-bold text-cyan-700">{subject}</span>
                    </td>
                    <td className="px-8 py-5 text-slate-500">{date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <div className="space-y-6">
            <article className="rounded-2xl border-2 border-cyan-300 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-extrabold">Study Assistant</h3>
              <span className="text-xs font-extrabold text-green-500">ONLINE</span>
              <div className="mt-6 ml-auto max-w-[260px] rounded-2xl bg-[#d9e8ff] p-4">
                Summarize this document for me
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 p-4 leading-6">
                Here is a short summary of Quantum_Physics_Vol4.pdf. This volume covers
                Heisenberg's uncertainty principle, wave-particle duality, and more.
              </div>
              <div className="mt-5 flex gap-2 overflow-hidden text-sm font-bold text-cyan-700">
                <span className="rounded-full bg-cyan-100 px-4 py-2">Summarize</span>
                <span className="rounded-full bg-cyan-100 px-4 py-2">Explain Concepts</span>
              </div>
              <div className="mt-5 flex h-12 items-center justify-between rounded-xl bg-[#edf2fa] px-4 text-slate-500">
                Ask AI anything...
                <button className="grid h-8 w-8 place-items-center rounded-lg bg-[#3b2be0] text-white">›</button>
              </div>
            </article>
            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex justify-between text-lg font-extrabold">
                <span>Uploading...</span>
                <span className="text-[#3427d9]">75%</span>
              </div>
              <p className="mt-4 text-sm text-slate-500">Neural_Networks_Thesis.pdf</p>
              <div className="mt-4 h-2 rounded-full bg-[#dfe8ff]">
                <div className="h-2 w-3/4 rounded-full bg-[#3b2be0]" />
              </div>
            </article>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex justify-between">
            <h2 className="text-2xl font-extrabold">Subject Overview</h2>
            <button className="font-bold text-[#3427d9]">Manage Subjects</button>
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {['Software Engineering', 'Database Systems', 'Artificial Intelligence'].map((subject, index) => (
              <article key={subject} className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#e8e3ff] text-xl text-[#3427d9]">◇</div>
                <h3 className="mt-8 text-xl font-semibold">{subject}</h3>
                <p className="mt-2 font-medium text-slate-500">{[42, 28, 56][index]} documents uploaded</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

function Stat({ title, value, badge }) {
  return (
    <article className="rounded-2xl bg-white p-7 shadow-sm">
      <div className="flex justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#e8e3ff] text-[#3427d9]">□</span>
        {badge && <span className="rounded-md bg-green-100 px-3 py-1 text-sm font-bold text-green-600">{badge}</span>}
      </div>
      <div className="mt-8 text-3xl font-extrabold">{value}</div>
      <div className="mt-1 text-base font-bold leading-5 text-[#4f5668]">{title}</div>
    </article>
  )
}
