/** Labels for document text extraction status (SCRUM-49). */
export const EXTRACTION_STATUS_META = {
  PENDING: {
    label: 'Extracting',
    hint: 'Text is being extracted. Chat may have limited context until ready.',
    className: 'bg-amber-50 text-amber-800',
  },
  EXTRACTED: {
    label: 'Ready for AI',
    hint: 'Text extracted — best for chatbot grounding.',
    className: 'bg-emerald-50 text-emerald-700',
  },
  FAILED: {
    label: 'Extraction failed',
    hint: 'Could not read file text. Re-upload or use another format.',
    className: 'bg-red-50 text-red-700',
  },
}

export function extractionStatusMeta(status) {
  return EXTRACTION_STATUS_META[status] || {
    label: status || 'Unknown',
    hint: '',
    className: 'bg-slate-100 text-slate-600',
  }
}

export function isChatReady(status) {
  return status === 'EXTRACTED'
}
