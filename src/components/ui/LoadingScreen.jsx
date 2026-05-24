import { Loader2 } from 'lucide-react'

export default function LoadingScreen({ text = 'Đang tải...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
      <p className="text-gray-500 text-sm font-medium">{text}</p>
    </div>
  )
}
