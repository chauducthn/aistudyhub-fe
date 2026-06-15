import { AlertTriangle, Loader2 } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmDialog({ title, description, confirmLabel, tone = 'default', busy, onCancel, onConfirm }) {
  const confirmClass = tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#3525cd] hover:bg-[#2d1fb0]'
  const iconBg = tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-[#eef0ff] text-[#3525cd]'

  return (
    <Modal onClose={onCancel} maxWidth="max-w-md">
      <div className="text-center">
        <span className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl ${iconBg}`}>
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-extrabold text-[#0b1c30]">{title}</h2>
        <p className="mt-2 text-sm text-[#464555]">{description}</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[#c7c4d8]/40 bg-white text-sm font-bold text-[#0b1c30] transition hover:bg-[#eff4ff]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
