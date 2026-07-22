import { Loader2, Send } from 'lucide-react'
import DocumentContextSelect from './DocumentContextSelect'

export default function ChatComposer({
  input,
  onInputChange,
  onSubmit,
  sending,
  documents,
  searchingPublicDocuments,
  publicDocumentSearchError,
  onSearchPublicDocuments,
  documentId,
  onDocumentIdChange,
  currentUserId,
}) {
  return (
    <form onSubmit={onSubmit} className="border-t border-[#c7c4d8]/20 bg-[#f8f9ff] px-4 py-3 sm:px-6">
      <DocumentContextSelect
        documents={documents}
        searchingPublicDocuments={searchingPublicDocuments}
        publicDocumentSearchError={publicDocumentSearchError}
        onSearchPublicDocuments={onSearchPublicDocuments}
        documentId={documentId}
        onDocumentIdChange={onDocumentIdChange}
        currentUserId={currentUserId}
      />
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent?.isComposing || e.isComposing) return
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSubmit(e)
            }
          }}
          rows={1}
          placeholder="Ask AI anything... (Enter to send, Shift+Enter for newline)"
          className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-[#c7c4d8]/40 bg-white px-4 py-2.5 text-sm text-[#0b1c30] outline-none focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/15"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white transition hover:bg-[#2d1fb0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </button>
      </div>
    </form>
  )
}
