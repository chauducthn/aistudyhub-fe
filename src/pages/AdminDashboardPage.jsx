import DashboardShell from '../components/DashboardShell'

const users = ['John Doe', 'Mary Taylor', 'Sarah Jenkins', 'David Miller', 'Elena Rodriguez', 'Alex Rivers', 'Michael Brown']

export default function AdminDashboardPage() {
  return (
    <DashboardShell type="admin">
      <div className="px-8 py-10 lg:px-10">
        <header className="mb-10 flex h-16 items-center gap-6 rounded-none bg-white px-8 shadow-sm">
          <input
            className="h-11 flex-1 rounded-full bg-[#edf2fa] px-6 font-semibold outline-none"
            placeholder="Search users, documents, or subjects..."
          />
          <span className="text-2xl">◌</span>
          <span className="text-2xl">⚙</span>
          <div className="h-9 w-px bg-slate-200" />
          <div className="font-extrabold">Admin Tri</div>
          <span className="rounded-full bg-[#e8e3ff] px-3 py-1 text-xs font-extrabold text-[#3427d9]">ADMIN</span>
        </header>

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <h1 className="text-4xl font-extrabold">Welcome back, Admin!</h1>
            <p className="mt-3 text-xl font-semibold text-[#4f5668]">
              Monitor system activity, review documents, and manage AI Study Hub.
            </p>
          </div>
          <button className="h-16 rounded-xl bg-[#3b2be0] px-9 text-lg font-bold text-white">+ New Research Project</button>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-3 xl:grid-cols-5">
          <Metric label="Total Users" value="12,842" tag="+12%" />
          <Metric label="Active Users" value="2,410" tag="Daily" />
          <Metric label="Locked" value="42" tag="Alert" />
          <Metric label="Total Docs" value="1.2M" tag="Archive" />
          <Metric label="Pending Review" value="18" tag="18 Urgent" />
        </section>
        <section className="mt-6 grid gap-5 md:grid-cols-4">
          <Metric label="Hidden Docs" value="56" />
          <Metric label="Total Subjects" value="24" />
          <Metric label="AI Sessions" value="45,901" />
          <Metric label="Storage Used" value="4.2 TB" />
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[2fr_1fr]">
          <article className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-extrabold">System Activity Overview</h2>
                <p className="font-semibold text-slate-500">User growth vs Content uploads</p>
              </div>
              <button className="rounded-lg border border-slate-300 bg-[#edf2fa] px-5 py-3 font-bold">This Month</button>
            </div>
            <div className="mt-12 flex h-64 items-end gap-6 border-t border-slate-200 px-4">
              {[45, 62, 50, 78, 34, 98, 66, 112, 55, 86].map((height, index) => (
                <div
                  key={index}
                  className={`w-9 rounded-t-lg ${index % 2 ? 'bg-cyan-700' : 'bg-[#3b2be0]'}`}
                  style={{ height }}
                />
              ))}
            </div>
            <div className="mt-6 flex gap-8 font-semibold text-slate-500">
              <span>● New Users</span>
              <span>● Uploads</span>
            </div>
          </article>

          <article className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold">Storage Capacity</h2>
            <p className="font-semibold text-slate-500">Infrastructure Health</p>
            <div className="mx-auto mt-10 grid h-44 w-44 place-items-center rounded-full border-[14px] border-[#3b2be0]">
              <div className="text-center">
                <div className="text-4xl font-extrabold">75%</div>
                <div className="font-semibold text-slate-500">4.2 / 5.6 TB</div>
              </div>
            </div>
            {['PDF Documents 2.8 TB', 'Office Files (DOCX/PPTX) 1.1 TB', 'System Metadata 0.3 TB'].map((item, index) => (
              <div key={item} className="mt-5">
                <div className="flex justify-between text-sm font-bold text-slate-600">
                  <span>{item.split(' ').slice(0, -2).join(' ')}</span>
                  <span>{item.split(' ').slice(-2).join(' ')}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#dfe8ff]">
                  <div className={`h-2 rounded-full ${index === 1 ? 'bg-cyan-700' : 'bg-[#3b2be0]'}`} style={{ width: ['68%', '48%', '32%'][index] }} />
                </div>
              </div>
            ))}
          </article>
        </section>

        <section className="mt-8 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between px-8 py-7">
            <div>
              <h2 className="text-2xl font-extrabold">Pending Document Review</h2>
              <p className="font-semibold text-slate-500">Action required for flags and reports</p>
            </div>
            <button className="font-bold text-[#3427d9]">View All Alerts</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-[#eef4ff] text-sm font-extrabold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-8 py-4">Title</th>
                <th className="px-4 py-4">Uploaded By</th>
                <th className="px-4 py-4">Subject</th>
                <th className="px-4 py-4">Size</th>
                <th className="px-4 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {['Deep Learning Notes', 'SQL Optimization Guide'].map((title, index) => (
                <tr key={title} className="border-t border-slate-100">
                  <td className="px-8 py-5 font-semibold">{title}</td>
                  <td className="px-4 py-5 text-slate-600">{index ? 'Sarah Jenkins' : 'Alex Rivera'}</td>
                  <td className="px-4 py-5"><span className="rounded-md bg-cyan-100 px-3 py-1 text-xs font-bold">AI</span></td>
                  <td className="px-4 py-5 text-slate-600">{index ? '2.1 MB' : '12.4 MB'}</td>
                  <td className="px-4 py-5"><span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">Pending Review</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[2fr_1fr]">
          <article className="rounded-2xl bg-white shadow-sm">
            <div className="flex justify-between px-8 py-6">
              <h2 className="text-2xl font-extrabold">Recent Users</h2>
              <button className="rounded-lg bg-[#edf2fa] px-5 py-3 font-bold">Manage Users</button>
            </div>
            {users.map((name, index) => (
              <div key={name} className="grid grid-cols-[1fr_120px_120px] border-t border-slate-100 px-8 py-4">
                <span className="font-semibold">{name}</span>
                <span className="text-slate-500">{index === 4 ? 'Admin' : index % 3 ? 'Researcher' : 'Student'}</span>
                <span className={index === 1 || index === 3 ? 'font-bold text-red-600' : 'font-bold text-green-700'}>
                  {index === 1 || index === 3 ? 'Locked' : 'Active'}
                </span>
              </div>
            ))}
          </article>

          <div className="space-y-8">
            <article className="rounded-2xl bg-[#3b2be0] p-8 text-white shadow-[0_18px_35px_rgba(59,43,224,0.35)]">
              <h2 className="text-xl font-extrabold">Quick Admin Actions</h2>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {['Invite Admin', 'Backup DB', 'Broadcast', 'Maintenance'].map((item) => (
                  <button key={item} className="rounded-xl bg-white/15 px-4 py-5 font-bold">{item}</button>
                ))}
              </div>
            </article>
            <article className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-extrabold">Subject Activity</h2>
              {['Software Eng.', 'Database Systems', 'Artificial Intelligence', 'Web Dev'].map((subject) => (
                <div key={subject} className="mt-5 rounded-xl bg-[#edf2fa] p-4 font-bold">{subject}</div>
              ))}
            </article>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

function Metric({ label, value, tag }) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e8e3ff] text-[#3427d9]">□</span>
        {tag && <span className="rounded-md bg-[#edf2fa] px-3 py-1 text-xs font-extrabold text-[#3427d9]">{tag}</span>}
      </div>
      <div className="mt-7 text-xs font-extrabold uppercase text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-extrabold">{value}</div>
    </article>
  )
}
