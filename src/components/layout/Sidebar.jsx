import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import clsx from 'clsx'
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ClipboardList,
  Bell,
  LogOut,
  GraduationCap,
  Users,
  BookMarked,
  BarChart3,
  Settings,
  ChevronRight,
} from 'lucide-react'

const studentLinks = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/student/courses', icon: BookOpen, label: 'Môn học' },
  { to: '/student/schedule', icon: Calendar, label: 'Thời khóa biểu' },
  { to: '/student/grades', icon: ClipboardList, label: 'Kết quả học tập' },
  { to: '/student/announcements', icon: Bell, label: 'Thông báo' },
]

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/admin/students', icon: Users, label: 'Sinh viên' },
  { to: '/admin/courses', icon: BookMarked, label: 'Môn học' },
  { to: '/admin/reports', icon: BarChart3, label: 'Báo cáo' },
  { to: '/admin/announcements', icon: Bell, label: 'Thông báo' },
  { to: '/admin/settings', icon: Settings, label: 'Cài đặt' },
]

export default function Sidebar({ role = 'student' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = role === 'admin' ? adminLinks : studentLinks

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50 shadow-sm">

      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">EduManage</p>
            <p className="text-xs text-gray-400">
              {role === 'admin' ? 'Quản trị hệ thống' : 'Cổng sinh viên'}
            </p>
          </div>
        </div>
      </div>


      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={clsx('w-5 h-5 flex-shrink-0', isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600')} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>


      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 mb-2">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
