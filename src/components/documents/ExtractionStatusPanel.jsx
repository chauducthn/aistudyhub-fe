import { Link } from 'react-router-dom'
import { Bot } from 'lucide-react'
import ExtractionStatusBadge from './ExtractionStatusBadge'
import { extractionStatusMeta, isChatReady } from '../../utils/extractionStatus'

function formatExtractedAt(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

/** SCRUM-49 — shared extraction status block for document screens. */
export default function ExtractionStatusPanel({
  doc,
  showChatLink = true,
  compact = false,
}) {
  if (!doc?.extractionStatus) return null

  const meta = extractionStatusMeta(doc.extractionStatus)
  const extractedAt = formatExtractedAt(doc.extractedAt)

  return (
    <div
      className={`rounded-2xl border border-[#c7c4d8]/25 bg-white shadow-sm ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`font-extrabold text-[#0b1c30] ${compact ? 'text-base' : 'text-lg'}`}>
          AI text extraction
        </h2>
        <ExtractionStatusBadge status={doc.extractionStatus} />
      </div>
      <p className={`mt-2 text-[#464555] ${compact ? 'text-xs' : 'text-sm'}`}>{meta.hint}</p>
      {extractedAt && (
        <p className="mt-1 text-xs font-semibold text-[#74798a]">Extracted at {extractedAt}</p>
      )}
      {doc.extractionStatus === 'FAILED' && doc.extractionError && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {doc.extractionError}
        </p>
      )}
      {showChatLink && isChatReady(doc.extractionStatus) && (
        <Link
          to={`/chatbot?doc=${doc.id}`}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#3525cd] px-4 text-sm font-bold text-white hover:bg-[#2d1fb0]"
        >
          <Bot className="h-4 w-4" />
          Chat with this document
        </Link>
      )}
      {showChatLink && doc.extractionStatus === 'PENDING' && (
        <p className="mt-3 text-xs font-semibold text-amber-700">
          Text is still processing. You can chat now, but answers may have limited document context.
        </p>
      )}
    </div>
  )
}
