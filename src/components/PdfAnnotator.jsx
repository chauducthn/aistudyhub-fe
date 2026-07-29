import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Check,
  Highlighter,
  Loader2,
  MousePointer2,
  PenLine,
  Save,
  StickyNote,
  Trash2,
  Undo2,
  X,
} from 'lucide-react'
import * as pdfjs from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PDFDocument, rgb } from 'pdf-lib'
import { updateDocumentContent } from '../api/documentsApi'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

export default function PdfAnnotator({ blob, previewUrl, fileName, documentId, onSaveSuccess }) {
  const [pdf, setPdf] = useState(null)
  const [sourceBytes, setSourceBytes] = useState(null)
  const [annotations, setAnnotations] = useState([])
  const [tool, setTool] = useState('select')
  const [noteText, setNoteText] = useState('')
  const [pendingSignature, setPendingSignature] = useState('')
  const [signatureOpen, setSignatureOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    let task
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const source = blob || await (await fetch(previewUrl)).blob()
        const bytes = new Uint8Array(await source.arrayBuffer())
        task = pdfjs.getDocument({ data: bytes.slice() })
        const loadedPdf = await task.promise
        if (active) {
          setSourceBytes(bytes)
          setPdf(loadedPdf)
        }
      } catch (err) {
        if (active) setError(err.message || 'Could not load the PDF document.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
      task?.destroy()
    }
  }, [blob, previewUrl])

  const addAnnotation = (annotation) => {
    setSaved(false)
    setAnnotations((current) => [...current, annotation])
  }

  const handlePageClick = (pageIndex, point) => {
    if (tool === 'note') {
      if (!noteText.trim()) {
        setError('Enter annotation text before clicking on the PDF.')
        return
      }
      addAnnotation({
        id: crypto.randomUUID(),
        type: 'note',
        pageIndex,
        x: point.x,
        y: point.y,
        width: 0.3,
        height: 0.1,
        text: noteText.trim(),
      })
      setNoteText('')
      setTool('select')
      setError('')
    } else if (tool === 'signature') {
      if (!pendingSignature) {
        setSignatureOpen(true)
        return
      }
      addAnnotation({
        id: crypto.randomUUID(),
        type: 'signature',
        pageIndex,
        x: point.x,
        y: point.y,
        width: 0.26,
        height: 0.09,
        image: pendingSignature,
      })
      setPendingSignature('')
      setTool('select')
    }
  }

  const savePdf = async () => {
    if (!sourceBytes || annotations.length === 0) return
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const output = await PDFDocument.load(sourceBytes.slice())
      const pages = output.getPages()

      for (const annotation of annotations) {
        const page = pages[annotation.pageIndex]
        if (!page) continue
        const { width: pageWidth, height: pageHeight } = page.getSize()
        const x = clamp(annotation.x, 0, 1) * pageWidth
        const width = Math.min(annotation.width * pageWidth, pageWidth - x)
        const height = annotation.height * pageHeight
        const y = pageHeight - clamp(annotation.y, 0, 1) * pageHeight - height

        if (annotation.type === 'highlight') {
          page.drawRectangle({
            x,
            y,
            width,
            height,
            color: rgb(1, 0.9, 0.12),
            opacity: 0.38,
          })
        } else if (annotation.type === 'note') {
          const notePng = await output.embedPng(renderNotePng(annotation.text))
          page.drawImage(notePng, { x, y, width, height })
        } else if (annotation.type === 'signature') {
          const signature = await output.embedPng(annotation.image)
          page.drawImage(signature, { x, y, width, height })
        }
      }

      const bytes = await output.save()
      const result = await updateDocumentContent(documentId, {
        base64Data: bytesToBase64(bytes),
      })
      if (!result.success) throw new Error(result.message || 'Could not save PDF annotations.')
      setAnnotations([])
      setSourceBytes(new Uint8Array(bytes))
      setSaved(true)
      await onSaveSuccess?.()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not save PDF annotations.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="grid h-[620px] place-items-center bg-[#e9edf3]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#3525cd]" />
          <p className="mt-3 text-sm font-semibold text-[#74798a]">Opening PDF editor...</p>
        </div>
      </div>
    )
  }

  if (error && !pdf) {
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
    <div className="flex h-[720px] flex-col bg-[#e9edf3]">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-300 bg-white px-3 py-2">
        <span className="mr-2 max-w-48 truncate text-xs font-extrabold text-[#0b1c30]">{fileName}</span>
        <ToolButton active={tool === 'select'} onClick={() => setTool('select')} icon={MousePointer2}>
          Select
        </ToolButton>
        <ToolButton active={tool === 'highlight'} onClick={() => setTool('highlight')} icon={Highlighter}>
          Highlight
        </ToolButton>
        <ToolButton active={tool === 'note'} onClick={() => setTool('note')} icon={StickyNote}>
          Note
        </ToolButton>
        <ToolButton
          active={tool === 'signature'}
          onClick={() => {
            setTool('signature')
            if (!pendingSignature) setSignatureOpen(true)
          }}
          icon={PenLine}
        >
          Signature
        </ToolButton>

        {tool === 'note' && (
          <input
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="Enter note, then click a page"
            className="h-9 min-w-52 flex-1 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#3525cd]"
          />
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAnnotations((current) => current.slice(0, -1))}
            disabled={annotations.length === 0 || saving}
            title="Undo last annotation"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setAnnotations([])}
            disabled={annotations.length === 0 || saving}
            title="Clear annotations"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-red-600 hover:bg-red-50 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={savePdf}
            disabled={annotations.length === 0 || saving}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#3525cd] px-4 text-xs font-extrabold text-white hover:bg-[#2d1fb0] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save PDF
          </button>
        </div>
      </div>

      {(error || saved || tool !== 'select') && (
        <div className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold ${
          error ? 'bg-red-50 text-red-700' : saved ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
        }`}>
          {error ? <AlertCircle className="h-4 w-4" /> : saved ? <Check className="h-4 w-4" /> : null}
          {error || (saved
            ? 'PDF annotations were saved successfully.'
            : tool === 'highlight'
              ? 'Drag across an area on any page to highlight it.'
              : tool === 'note'
                ? 'Enter a note above, then click where it should appear.'
                : 'Create a signature, then click where it should appear.')}
        </div>
      )}

      <div className="flex-1 overflow-auto p-5">
        <div className="mx-auto flex w-fit flex-col gap-5">
          {pdf && Array.from({ length: pdf.numPages }, (_, pageIndex) => (
            <PdfPage
              key={pageIndex}
              pdf={pdf}
              pageIndex={pageIndex}
              tool={tool}
              annotations={annotations.filter((item) => item.pageIndex === pageIndex)}
              onAdd={addAnnotation}
              onClick={handlePageClick}
            />
          ))}
        </div>
      </div>

      {signatureOpen && (
        <SignatureDialog
          onClose={() => {
            setSignatureOpen(false)
            if (!pendingSignature) setTool('select')
          }}
          onUse={(image) => {
            setPendingSignature(image)
            setSignatureOpen(false)
            setTool('signature')
          }}
        />
      )}
    </div>
  )
}

function PdfPage({ pdf, pageIndex, tool, annotations, onAdd, onClick }) {
  const canvasRef = useRef(null)
  const wrapperRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [drag, setDrag] = useState(null)

  useEffect(() => {
    let renderTask
    let active = true
    ;(async () => {
      const page = await pdf.getPage(pageIndex + 1)
      const viewport = page.getViewport({ scale: 1.35 })
      const canvas = canvasRef.current
      if (!canvas || !active) return
      const ratio = window.devicePixelRatio || 1
      canvas.width = viewport.width * ratio
      canvas.height = viewport.height * ratio
      canvas.style.width = `${viewport.width}px`
      canvas.style.height = `${viewport.height}px`
      const context = canvas.getContext('2d')
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      setSize({ width: viewport.width, height: viewport.height })
      renderTask = page.render({ canvasContext: context, viewport })
      await renderTask.promise
    })()
    return () => {
      active = false
      renderTask?.cancel()
    }
  }, [pdf, pageIndex])

  const pointFromEvent = (event) => {
    const rect = wrapperRef.current.getBoundingClientRect()
    return {
      x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
    }
  }

  const pointerDown = (event) => {
    if (tool === 'highlight') {
      event.currentTarget.setPointerCapture(event.pointerId)
      const point = pointFromEvent(event)
      setDrag({ start: point, end: point })
    } else if (tool === 'note' || tool === 'signature') {
      onClick(pageIndex, pointFromEvent(event))
    }
  }

  const pointerMove = (event) => {
    if (drag) setDrag((current) => ({ ...current, end: pointFromEvent(event) }))
  }

  const pointerUp = () => {
    if (!drag) return
    const x = Math.min(drag.start.x, drag.end.x)
    const y = Math.min(drag.start.y, drag.end.y)
    const width = Math.abs(drag.end.x - drag.start.x)
    const height = Math.abs(drag.end.y - drag.start.y)
    if (width > 0.01 && height > 0.005) {
      onAdd({
        id: crypto.randomUUID(),
        type: 'highlight',
        pageIndex,
        x,
        y,
        width,
        height,
      })
    }
    setDrag(null)
  }

  return (
    <div className="relative bg-white shadow-lg" style={{ width: size.width || 600, minHeight: size.height || 780 }}>
      <canvas ref={canvasRef} className="block" />
      <div
        ref={wrapperRef}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        className={`absolute inset-0 ${tool === 'select' ? 'pointer-events-none' : 'cursor-crosshair touch-none'}`}
      >
        {annotations.map((annotation) => (
          <AnnotationOverlay key={annotation.id} annotation={annotation} />
        ))}
        {drag && (
          <div
            className="absolute border border-amber-400 bg-yellow-300/40"
            style={rectStyle({
              x: Math.min(drag.start.x, drag.end.x),
              y: Math.min(drag.start.y, drag.end.y),
              width: Math.abs(drag.end.x - drag.start.x),
              height: Math.abs(drag.end.y - drag.start.y),
            })}
          />
        )}
      </div>
      <span className="absolute bottom-2 right-3 rounded bg-slate-900/60 px-2 py-0.5 text-[10px] font-bold text-white">
        {pageIndex + 1}
      </span>
    </div>
  )
}

function AnnotationOverlay({ annotation }) {
  if (annotation.type === 'highlight') {
    return <div className="absolute bg-yellow-300/40" style={rectStyle(annotation)} />
  }
  if (annotation.type === 'note') {
    return (
      <div
        className="absolute overflow-hidden rounded border border-amber-400 bg-amber-100/95 p-1 text-[9px] leading-tight text-slate-900 shadow"
        style={rectStyle(annotation)}
      >
        {annotation.text}
      </div>
    )
  }
  return (
    <img
      src={annotation.image}
      alt="Signature"
      className="absolute object-contain"
      style={rectStyle(annotation)}
    />
  )
}

function SignatureDialog({ onClose, onUse }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const hasInk = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ratio = window.devicePixelRatio || 1
    canvas.width = 520 * ratio
    canvas.height = 180 * ratio
    canvas.style.width = '520px'
    canvas.style.height = '180px'
    const context = canvas.getContext('2d')
    context.scale(ratio, ratio)
    context.lineWidth = 2.5
    context.lineCap = 'round'
    context.strokeStyle = '#0b1c30'
  }, [])

  const point = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const start = (event) => {
    drawing.current = true
    hasInk.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    const context = canvasRef.current.getContext('2d')
    const current = point(event)
    context.beginPath()
    context.moveTo(current.x, current.y)
  }

  const move = (event) => {
    if (!drawing.current) return
    const context = canvasRef.current.getContext('2d')
    const current = point(event)
    context.lineTo(current.x, current.y)
    context.stroke()
  }

  const clear = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    hasInk.current = false
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#0b1c30]">Create signature</h3>
            <p className="mt-1 text-xs text-[#74798a]">Draw with your mouse, stylus, or finger.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 overflow-auto rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
          <canvas
            ref={canvasRef}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={() => { drawing.current = false }}
            onPointerCancel={() => { drawing.current = false }}
            className="block touch-none"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={clear} className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700">
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              if (hasInk.current) onUse(canvasRef.current.toDataURL('image/png'))
            }}
            className="h-10 rounded-lg bg-[#3525cd] px-5 text-sm font-bold text-white"
          >
            Use signature
          </button>
        </div>
      </div>
    </div>
  )
}

function ToolButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition ${
        active
          ? 'border-[#3525cd] bg-indigo-50 text-[#3525cd]'
          : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  )
}

function rectStyle(item) {
  return {
    left: `${item.x * 100}%`,
    top: `${item.y * 100}%`,
    width: `${item.width * 100}%`,
    height: `${item.height * 100}%`,
  }
}

function renderNotePng(text) {
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 300
  const context = canvas.getContext('2d')
  context.fillStyle = '#fff4b8'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = '#d69e00'
  context.lineWidth = 5
  context.strokeRect(2.5, 2.5, canvas.width - 5, canvas.height - 5)
  context.fillStyle = '#172033'
  context.font = '32px Arial, sans-serif'
  context.textBaseline = 'top'
  const words = text.split(/\s+/)
  let line = ''
  let y = 28
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (context.measureText(candidate).width > 840 && line) {
      context.fillText(line, 28, y)
      line = word
      y += 42
      if (y > 250) break
    } else {
      line = candidate
    }
  }
  if (y <= 250) context.fillText(line, 28, y)
  return canvas.toDataURL('image/png')
}

function bytesToBase64(bytes) {
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }
  return window.btoa(binary)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
