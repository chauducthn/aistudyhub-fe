import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import ExtractionStatusBadge from '../documents/ExtractionStatusBadge'
import { extractionStatusMeta, isChatReady } from '../../utils/extractionStatus'

export default function DocumentContextSelect({
  documents,
  documentId,
  onDocumentIdChange,
}) {
  const selectedDoc = documents.find((d) => String(d.id) === String(documentId))
  const selectedMeta = selectedDoc ? extractionStatusMeta(selectedDoc.extractionStatus) : null

  return (
    <div className="mb-2.5 flex flex-wrap items-center gap-2 text-xs">
      <span className="inline-flex items-center gap-1.5 font-bold text-[#74798a]">
        <FileText className="h-3.5 w-3.5" />
        Document context:
      </span>
      {documents.length > 0 ? (
        <>
          <select
            id="chat-doc"
            value={documentId}
            onChange={(e) => onDocumentIdChange(e.target.value)}
            className="max-w-xs rounded-lg border border-[#c7c4d8]/50 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0b1c30] outline-none focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/15"
          >
            <option value="">No document (general help)</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id} disabled={d.extractionStatus === 'FAILED'}>
                {d.title}
                {d.source === 'public' ? ' · public' : ''}
                {d.extractionStatus === 'FAILED' ? ' · unavailable' : ''}
              </option>
            ))}
          </select>
          {selectedDoc ? (
            <span className="inline-flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#e8e3ff] px-2 py-1 font-bold text-[#3525cd]">
                {selectedDoc.source === 'public' ? 'Public:' : 'Mine:'} {selectedDoc.title}
              </span>
              <ExtractionStatusBadge status={selectedDoc.extractionStatus} />
              {!isChatReady(selectedDoc.extractionStatus) && (
                <span className="text-[#74798a]" title={selectedMeta?.hint}>
                  Limited context until extraction completes.
                </span>
              )}
            </span>
          ) : (
            <span className="text-[#74798a]">Own docs + public docs you can access.</span>
          )}
        </>
      ) : (
        <span className="text-[#74798a]">
          No documents yet —{' '}
          <Link to="/upload" className="font-bold text-[#3525cd] hover:underline">
            upload one
          </Link>{' '}
          or browse{' '}
          <Link to="/public-documents" className="font-bold text-[#3525cd] hover:underline">
            public documents
          </Link>
          .
        </span>
      )}
    </div>
  )
}
