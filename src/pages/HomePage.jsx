import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    title: 'Kho tài liệu tập trung',
    description:
      'Lưu trữ PDF, DOCX, PPTX, TXT trên đám mây — không còn file rải rác trên Drive, Messenger hay USB.',
    icon: '📚',
  },
  {
    title: 'Tìm kiếm & phân loại',
    description:
      'Tìm theo từ khóa, lọc theo danh mục môn học do bạn tự tạo. Chế độ Public/Private linh hoạt.',
    icon: '🔍',
  },
  {
    title: 'Trợ lý AI theo ngữ cảnh',
    description:
      'Hỏi đáp, tóm tắt và giải thích nội dung trực tiếp từ từng tài liệu học tập (RAG).',
    icon: '🤖',
  },
]

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-medium backdrop-blur">
            Nền tảng học tập thông minh
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            AI Study Hub — Quản lý học liệu & ôn tập cùng AI
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-indigo-100">
            Tập trung tài liệu, tìm kiếm nhanh theo môn học và trò chuyện với trợ lý AI bám sát nội dung
            từng file — giúp bạn ôn thi hiệu quả hơn.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            {isAuthenticated ? (
              <div className="rounded-xl bg-white/10 px-6 py-4 backdrop-blur">
                <p className="text-sm text-indigo-100">Đã đăng nhập</p>
                <p className="text-xl font-semibold">{user?.fullName}</p>
              </div>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
                >
                  Bắt đầu miễn phí
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Tính năng chính</h2>
          <p className="mt-3 text-slate-600">
            Giải pháp cho sinh viên và giảng viên — từ lưu trữ đến hỏi đáp AI
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <span className="text-3xl" role="img" aria-hidden="true">
                {feature.icon}
              </span>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-slate-600 leading-relaxed">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900">Sẵn sàng tổ chức học liệu của bạn?</h2>
          <p className="mt-3 text-slate-600">
            Tạo tài khoản trong vài giây — mật khẩu tối thiểu 6 ký tự, bảo mật BCrypt.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="mt-8 inline-block rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Đăng ký ngay
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
