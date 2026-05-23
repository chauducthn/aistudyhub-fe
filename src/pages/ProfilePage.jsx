import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Tai khoan</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Ho so ca nhan</h1>
        <p className="mt-3 text-slate-600">
          Thong tin dang nhap hien tai. Cac chuc nang cap nhat ho so va doi mat khau se noi vao
          endpoint profile o buoc tiep theo.
        </p>
      </div>

      <div className="mt-8 max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white">
        <dl className="divide-y divide-slate-200">
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Ho ten</dt>
            <dd className="text-sm font-semibold text-slate-900 sm:col-span-2">{user.fullName}</dd>
          </div>
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Email</dt>
            <dd className="text-sm text-slate-900 sm:col-span-2">{user.email}</dd>
          </div>
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Vai tro</dt>
            <dd className="text-sm text-slate-900 sm:col-span-2">{user.role}</dd>
          </div>
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Trang thai</dt>
            <dd className="text-sm text-slate-900 sm:col-span-2">{user.status}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
