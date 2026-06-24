import { extractionStatusMeta } from '../../utils/extractionStatus'

export default function ExtractionStatusBadge({ status, compact = false }) {
  const meta = extractionStatusMeta(status)
  return (
    <span
      title={meta.hint}
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-extrabold uppercase ${
        compact ? 'text-[9px]' : 'text-[10px]'
      } ${meta.className}`}
    >
      {meta.label}
    </span>
  )
}
