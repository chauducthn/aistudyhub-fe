import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout({ children, role = 'student', title = '' }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role={role} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Topbar title={title} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
