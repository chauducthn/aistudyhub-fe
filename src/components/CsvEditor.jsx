import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { AlertCircle, Check, Edit2, FileSpreadsheet, Loader2, Plus, Save, X } from 'lucide-react'
import { updateDocumentContent } from '../api/documentsApi'

const MAX_VISIBLE_ROWS = 500
const MAX_VISIBLE_COLUMNS = 100

export default function CsvEditor({ blob, previewUrl, fileName, documentId, onSaveSuccess }) {
  const [rows, setRows] = useState([])
  const [originalRows, setOriginalRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const source = blob || await (await fetch(previewUrl)).blob()
        const text = await source.text()
        const workbook = XLSX.read(text, { type: 'string', raw: true })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const parsed = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true })
        if (active) {
          setRows(parsed)
          setOriginalRows(parsed.map((row) => [...row]))
        }
      } catch (err) {
        if (active) setError(err.message || 'Could not read the CSV file.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [blob, previewUrl])

  const columnCount = useMemo(
    () => Math.max(1, Math.min(MAX_VISIBLE_COLUMNS, rows.reduce((max, row) => Math.max(max, row.length), 0))),
    [rows],
  )
  const visibleRows = rows.slice(0, MAX_VISIBLE_ROWS)
  const truncated = rows.length > MAX_VISIBLE_ROWS
    || rows.some((row) => row.length > MAX_VISIBLE_COLUMNS)

  const updateCell = (rowIndex, columnIndex, value) => {
    setRows((current) => {
      const next = current.map((row) => [...row])
      while (next.length <= rowIndex) next.push([])
      while (next[rowIndex].length <= columnIndex) next[rowIndex].push('')
      next[rowIndex][columnIndex] = value
      return next
    })
  }

  const addRow = () => {
    setRows((current) => [...current, Array.from({ length: columnCount }, () => '')])
  }

  const cancelEditing = () => {
    setRows(originalRows.map((row) => [...row]))
    setEditing(false)
    setError('')
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const sheet = XLSX.utils.aoa_to_sheet(rows)
      const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: true })
      const result = await updateDocumentContent(documentId, { content: csv })
      if (!result.success) throw new Error(result.message || 'Could not save the CSV file.')
      setOriginalRows(rows.map((row) => [...row]))
      setEditing(false)
      await onSaveSuccess?.()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not save the CSV file.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="grid h-[620px] place-items-center bg-[#f8f9ff]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#3525cd]" />
          <p className="mt-3 text-sm font-semibold text-[#74798a]">Loading CSV data...</p>
        </div>
      </div>
    )
  }

  if (error && rows.length === 0) {
    return (
      <div className="grid h-[620px] place-items-center bg-[#f8f9ff] p-6 text-center">
        <div>
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[620px] flex-col bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#107c41] px-4 py-2 text-white">
        <div className="flex min-w-0 items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 shrink-0" />
          <span className="truncate text-sm font-bold">{fileName}</span>
          <span className="rounded bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase">CSV</span>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                type="button"
                onClick={addRow}
                disabled={saving}
                className="inline-flex h-8 items-center gap-1 rounded bg-white/15 px-3 text-xs font-bold hover:bg-white/25"
              >
                <Plus className="h-3.5 w-3.5" /> Add row
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex h-8 items-center gap-1 rounded bg-white px-3 text-xs font-bold text-[#107c41] disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="inline-flex h-8 items-center gap-1 rounded bg-[#07552d] px-3 text-xs font-bold"
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-8 items-center gap-1 rounded bg-white px-3 text-xs font-bold text-[#107c41]"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit CSV
            </button>
          )}
        </div>
      </div>

      {(error || truncated) && (
        <div className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold ${
          error ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'
        }`}>
          {error ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {error || `For performance, the editor displays the first ${MAX_VISIBLE_ROWS} rows and ${MAX_VISIBLE_COLUMNS} columns.`}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="sticky left-0 z-20 w-12 border border-slate-300 bg-slate-100 p-1 text-slate-500" />
              {Array.from({ length: columnCount }, (_, index) => (
                <th key={index} className="min-w-28 border border-slate-300 bg-slate-100 px-2 py-1.5 text-center font-bold text-slate-600">
                  {columnName(index)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <th className="sticky left-0 z-[5] border border-slate-300 bg-slate-100 px-2 text-center font-bold text-slate-500">
                  {rowIndex + 1}
                </th>
                {Array.from({ length: columnCount }, (_, columnIndex) => (
                  <td key={columnIndex} className="border border-slate-200 p-0">
                    {editing ? (
                      <input
                        value={row[columnIndex] ?? ''}
                        onChange={(event) => updateCell(rowIndex, columnIndex, event.target.value)}
                        className="h-8 w-full min-w-28 border-0 bg-white px-2 outline-none focus:bg-indigo-50 focus:ring-1 focus:ring-inset focus:ring-[#3525cd]"
                      />
                    ) : (
                      <div className="h-8 min-w-28 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-2 text-slate-700">
                        {String(row[columnIndex] ?? '')}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function columnName(index) {
  let name = ''
  let value = index
  do {
    name = String.fromCharCode(65 + (value % 26)) + name
    value = Math.floor(value / 26) - 1
  } while (value >= 0)
  return name
}
