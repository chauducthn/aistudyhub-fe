import React, { useEffect, useRef, useState } from 'react'
import * as docx from 'docx-preview'
import * as XLSX from 'xlsx'
import { Loader2, AlertCircle, FileSpreadsheet, FileText, Edit2, Save } from 'lucide-react'
import { updateDocumentContent, getDocumentEditorHtml } from '../api/documentsApi'

export default function OfficePreviewer({
  previewUrl,
  blob,
  type,
  fileName,
  fallbackText,
  documentId,
  onSaveSuccess,
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useFallback, setUseFallback] = useState(false)
  const [debugLogs, setDebugLogs] = useState([])

  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editorLoading, setEditorLoading] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [initialHtml, setInitialHtml] = useState('')
  const [gridData, setGridData] = useState([])

  // Excel states
  const [workbook, setWorkbook] = useState(null)
  const [sheets, setSheets] = useState([])
  const [activeSheet, setActiveSheet] = useState('')
  const [sheetHtml, setSheetHtml] = useState('')

  const containerRef = useRef(null)
  const editorRef = useRef(null)

  const addLog = (msg) => {
    console.log(`[OfficePreviewer Debug] ${msg}`)
    setDebugLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
  }

  // Initialize HTML once when entering edit mode, inheriting clean HTML from the database
  useEffect(() => {
    async function loadEditorContent() {
      if (isEditing && type === 'docx' && documentId) {
        setEditorLoading(true)
        setSaveError(null)
        try {
          addLog('Fetching clean editor HTML from backend...')
          const res = await getDocumentEditorHtml(documentId)
          if (res.success && res.data && res.data.html) {
            addLog('Clean editor HTML loaded successfully.')
            setInitialHtml(res.data.html)
          } else {
            throw new Error('Failed to resolve editor HTML.')
          }
        } catch (err) {
          addLog(`Failed to fetch clean HTML: ${err.message}. Using fallback...`)
          // Fallback to container DOM scraper
          let resolved = ''
          if (containerRef.current && containerRef.current.innerHTML.trim().length > 0) {
            resolved = containerRef.current.innerHTML
          } else if (fallbackText && fallbackText.trim().length > 0) {
            resolved = fallbackText
              .split('\n')
              .map(line => `<p>${line.trim()}</p>`)
              .filter(p => p !== '<p></p>')
              .join('')
          }
          if (!resolved || resolved.trim() === '') {
            resolved = '<p>Start typing your document contents...</p>'
          }
          setInitialHtml(resolved)
        } finally {
          setEditorLoading(false)
        }
      }
    }
    loadEditorContent()
  }, [isEditing, documentId, type, fallbackText])

  useEffect(() => {
    let isMounted = true

    async function loadPreview() {
      if (isEditing) return // Skip loading preview while editing
      setLoading(true)
      setError(null)
      setUseFallback(false)
      setDebugLogs([])
      try {
        addLog(`loadPreview invoked. Type: ${type}, FileName: ${fileName}`)
        let activeBlob = blob
        if (!activeBlob) {
          addLog('Blob prop is absent, fetching from previewUrl...')
          // Append cache buster to fetch fresh content from S3 after saving
          const fetchUrl = previewUrl.includes('?') 
            ? `${previewUrl}&t=${Date.now()}` 
            : `${previewUrl}?t=${Date.now()}`
          const response = await fetch(fetchUrl)
          addLog(`Fetch response status: ${response.status}`)
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          activeBlob = await response.blob()
        }

        addLog(`Blob resolved. Size: ${activeBlob.size} bytes, Type: ${activeBlob.type}`)

        if (type === 'docx') {
          if (!isMounted) return

          // docx-preview rendering
          if (containerRef.current) {
            containerRef.current.innerHTML = ''
            addLog('Resolving docx-preview renderAsync function...')
            const renderFn = docx.renderAsync
            addLog(`renderAsync type: ${typeof renderFn}`)
            if (typeof renderFn !== 'function') {
              throw new Error('docx-preview render function is not available.')
            }

            const styleContainer = document.createElement('div')
            containerRef.current.appendChild(styleContainer)

            const docContainer = document.createElement('div')
            containerRef.current.appendChild(docContainer)

            addLog('Initiating renderAsync call...')
            try {
              await renderFn(activeBlob, docContainer, styleContainer, {
                className: 'docx-preview-output',
                inWrapper: true,
                ignoreWidth: false,
                ignoreHeight: false,
                breakPages: true,
              })
              addLog(`renderAsync finished. docContainer child nodes: ${docContainer.childNodes.length}`)

              // Inspect child nodes to verify if anything is visible
              if (docContainer.childNodes.length === 0) {
                addLog('Render finished but no elements generated. Activating fallback...')
                setUseFallback(true)
              } else {
                addLog('Elements generated successfully.')
              }
            } catch (renderErr) {
              addLog(`renderAsync throw error: ${renderErr.message || renderErr}`)
              if (fallbackText) {
                addLog('Fallback text available. Switching to fallback view...')
                setUseFallback(true)
              } else {
                throw renderErr
              }
            }
          }
          setLoading(false)
        } else if (type === 'xlsx') {
          addLog('Reading excel file buffer...')
          const buffer = await activeBlob.arrayBuffer()
          if (!isMounted) return

          addLog('Parsing spreadsheet workbook...')
          const data = new Uint8Array(buffer)
          const wb = XLSX.read(data, { type: 'array' })
          setWorkbook(wb)
          setSheets(wb.SheetNames)
          addLog(`Workbook parsed. Sheets found: ${wb.SheetNames.join(', ')}`)
          if (wb.SheetNames.length > 0) {
            setActiveSheet(wb.SheetNames[0])
          }
          setLoading(false)
        }
      } catch (err) {
        addLog(`Error caught in loadPreview: ${err.message || err}`)
        if (isMounted) {
          setError(err.message || 'Error occurred while rendering file preview.')
          setLoading(false)
        }
      }
    }

    loadPreview()

    return () => {
      isMounted = false
    }
  }, [previewUrl, blob, type, fallbackText, isEditing])

  // Update Excel active sheet html table
  useEffect(() => {
    if (type === 'xlsx' && workbook && activeSheet) {
      const sheet = workbook.Sheets[activeSheet]
      // sheet_to_html outputs standard HTML table representation
      const html = XLSX.utils.sheet_to_html(sheet)
      setSheetHtml(html)

      // Also set AOA grid data for editing
      const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
      setGridData(aoa)
    }
  }, [workbook, activeSheet, type])

  const handleCellChange = (rowIndex, colIndex, val) => {
    setGridData((prev) => {
      const copy = prev.map((row) => [...row])
      while (copy.length <= rowIndex) {
        copy.push([])
      }
      while (copy[rowIndex].length <= colIndex) {
        copy[rowIndex].push('')
      }
      copy[rowIndex][colIndex] = val
      return copy
    })
  }

  function getColLetter(index) {
    let letter = ''
    while (index >= 0) {
      letter = String.fromCharCode((index % 26) + 65) + letter
      index = Math.floor(index / 26) - 1
    }
    return letter
  }

  function arrayBufferToBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  const getCleanHtmlForSave = (editorEl) => {
    if (!editorEl) return ''
    const clone = editorEl.cloneNode(true)
    const originalElements = editorEl.querySelectorAll('*')
    const clonedElements = clone.querySelectorAll('*')
    
    for (let i = 0; i < originalElements.length; i++) {
      const orig = originalElements[i]
      const cloned = clonedElements[i]
      
      const computed = window.getComputedStyle(orig)
      
      const textAlign = computed.textAlign
      const fontWeight = computed.fontWeight
      const fontStyle = computed.fontStyle
      const textDecoration = computed.textDecorationLine || computed.textDecoration
      const fontSize = computed.fontSize
      const color = computed.color
      
      let styleStr = ''
      if (textAlign && textAlign !== 'start' && textAlign !== 'left') {
        styleStr += `text-align: ${textAlign}; `
      }
      if (fontWeight === 'bold' || parseInt(fontWeight) >= 700) {
        styleStr += 'font-weight: bold; '
      }
      if (fontStyle === 'italic') {
        styleStr += 'font-style: italic; '
      }
      if (textDecoration && (textDecoration.includes('underline') || orig.tagName.toLowerCase() === 'u')) {
        styleStr += 'text-decoration: underline; '
      }
      if (fontSize) {
        styleStr += `font-size: ${fontSize}; `
      }
      // Avoid inlining default dark text colors, only write custom colors
      if (color && 
          color !== 'rgb(0, 0, 0)' && 
          color !== 'rgb(31, 34, 41)' && 
          color !== 'rgb(30, 41, 59)' && 
          color !== 'rgb(15, 23, 42)' &&
          !color.startsWith('rgba(0, 0, 0')) {
        styleStr += `color: ${color}; `
      }
      
      if (styleStr) {
        cloned.setAttribute('style', styleStr)
      }
    }
    
    return clone.innerHTML
  }

  const handleSave = async () => {
    if (!documentId) return
    setSaving(true)
    setSaveError(null)
    try {
      if (type === 'docx') {
        const html = getCleanHtmlForSave(editorRef.current)
        const res = await updateDocumentContent(documentId, { content: html })
        if (!res.success) throw new Error(res.message || 'Failed to save document content.')
      } else if (type === 'xlsx') {
        const sheet = workbook.Sheets[activeSheet]
        if (!sheet) throw new Error('Active sheet not found in workbook.')

        gridData.forEach((row, rIdx) => {
          row.forEach((val, cIdx) => {
            const cellRef = XLSX.utils.encode_cell({ r: rIdx, c: cIdx })
            if (val !== undefined && val !== null) {
              const cell = sheet[cellRef]
              if (cell) {
                cell.v = val
                if (typeof val === 'number') {
                  cell.t = 'n'
                } else if (typeof val === 'boolean') {
                  cell.t = 'b'
                } else {
                  cell.t = 's'
                }
                delete cell.w // Clear formatted text cache
              } else if (val !== '') {
                sheet[cellRef] = {
                  v: val,
                  t: typeof val === 'number' ? 'n' : (typeof val === 'boolean' ? 'b' : 's')
                }
              }
            }
          })
        })

        const out = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        const base64 = arrayBufferToBase64(out)
        const res = await updateDocumentContent(documentId, { base64Data: base64 })
        if (!res.success) throw new Error(res.message || 'Failed to save spreadsheet content.')
      }

      setIsEditing(false)
      if (onSaveSuccess) {
        onSaveSuccess()
      }
    } catch (err) {
      console.error(err)
      setSaveError(err.message || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value)
  }

  // Early return for loading and error ONLY for XLSX type in view mode
  if (type === 'xlsx' && !isEditing) {
    if (loading) {
      return (
        <div className="grid h-[620px] place-items-center bg-[#f8f9ff]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#3525cd]" />
            <p className="mt-3 text-sm font-semibold text-[#74798a]">
              Loading Spreadsheet sheets...
            </p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="grid h-[620px] place-items-center bg-[#f8f9ff] p-6 text-center">
          <div>
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-bold text-[#1f2229]">Unable to Preview</h3>
            <p className="mt-2 text-sm text-[#74798a] max-w-md">{error}</p>
          </div>
        </div>
      )
    }
  }

  if (type === 'docx') {
    if (isEditing) {
      return (
        <div className="h-[620px] flex flex-col bg-[#f0f1f5] border-t border-b border-[#c7c4d8]/20 docx-outer-wrapper relative">
          {/* Word Header bar */}
          <div className="bg-[#2b579a] text-white px-4 py-2 flex items-center justify-between shadow-sm shrink-0 select-none">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-white" />
              <span className="text-sm font-semibold truncate max-w-sm">{fileName}</span>
            </div>
            <div className="flex items-center gap-2">
              {saveError && <span className="text-xs text-red-200 font-medium mr-2">{saveError}</span>}
              <button
                onClick={handleSave}
                disabled={saving || editorLoading}
                className="inline-flex items-center gap-1.5 bg-white text-[#2b579a] hover:bg-slate-100 transition px-3 py-1 rounded text-xs font-bold shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setSaveError(null)
                }}
                disabled={saving}
                className="inline-flex items-center bg-[#1f3e6e] text-white hover:bg-[#152c50] transition px-3 py-1 rounded text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* WYSIWYG Editor Toolbar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2 shrink-0 select-none shadow-sm flex-wrap">
            <button
              onClick={() => handleFormat('bold')}
              title="Bold"
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700 font-bold text-sm w-8 h-8 flex items-center justify-center cursor-pointer transition"
            >
              B
            </button>
            <button
              onClick={() => handleFormat('italic')}
              title="Italic"
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700 italic text-sm w-8 h-8 flex items-center justify-center cursor-pointer transition"
            >
              I
            </button>
            <button
              onClick={() => handleFormat('underline')}
              title="Underline"
              className="p-1.5 hover:bg-slate-200 rounded text-slate-700 underline text-sm w-8 h-8 flex items-center justify-center cursor-pointer transition"
            >
              U
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            
            {/* Alignment buttons */}
            <button
              onClick={() => handleFormat('justifyLeft')}
              title="Align Left"
              className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 text-xs cursor-pointer transition font-medium"
            >
              Left
            </button>
            <button
              onClick={() => handleFormat('justifyCenter')}
              title="Align Center"
              className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 text-xs cursor-pointer transition font-medium"
            >
              Center
            </button>
            <button
              onClick={() => handleFormat('justifyRight')}
              title="Align Right"
              className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 text-xs cursor-pointer transition font-medium"
            >
              Right
            </button>
            <button
              onClick={() => handleFormat('justifyFull')}
              title="Justify"
              className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 text-xs cursor-pointer transition font-medium"
            >
              Justify
            </button>
            
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button
              onClick={() => handleFormat('formatBlock', '<h1>')}
              title="Heading 1"
              className="px-2 py-1.5 hover:bg-slate-200 rounded text-slate-700 font-bold text-xs cursor-pointer transition"
            >
              H1
            </button>
            <button
              onClick={() => handleFormat('formatBlock', '<h2>')}
              title="Heading 2"
              className="px-2 py-1.5 hover:bg-slate-200 rounded text-slate-700 font-bold text-xs cursor-pointer transition"
            >
              H2
            </button>
            <button
              onClick={() => handleFormat('formatBlock', '<p>')}
              title="Paragraph"
              className="px-2 py-1.5 hover:bg-slate-200 rounded text-slate-700 text-xs cursor-pointer transition"
            >
              Normal
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button
              onClick={() => handleFormat('insertUnorderedList')}
              title="Bullet List"
              className="px-2 py-1.5 hover:bg-slate-200 rounded text-slate-700 text-xs cursor-pointer transition"
            >
              • List
            </button>
          </div>

          {/* WYSIWYG ContentEditable Area - displaying the exact DOM layout */}
          <div className="flex-1 p-6 overflow-auto flex justify-center bg-[#f0f1f5]">
            {editorLoading ? (
              <div className="grid place-items-center w-full h-full">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#2b579a]" />
                  <p className="mt-3 text-sm font-semibold text-[#74798a]">
                    Loading clean document content...
                  </p>
                </div>
              </div>
            ) : (
              <div
                ref={editorRef}
                contentEditable
                dangerouslySetInnerHTML={{ __html: initialHtml }}
                className="w-full bg-white border border-[#dcdde1] shadow-sm rounded-lg p-12 outline-none focus:ring-2 focus:ring-[#2b579a]/20 min-h-full overflow-y-auto docx-preview-output"
                style={{ minHeight: '100%', outline: 'none' }}
                placeholder="Start typing your document contents..."
              />
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="h-[620px] flex flex-col bg-[#f0f1f5] border-t border-b border-[#c7c4d8]/20 docx-outer-wrapper relative">
        <style dangerouslySetInnerHTML={{ __html: `
          .docx-outer-wrapper .docx-preview-output {
            box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
            background: #ffffff !important;
            padding: 48px 54px !important;
            max-width: 820px !important;
            width: 100% !important;
            min-height: 842px !important;
            border-radius: 6px !important;
            border: 1px solid #dcdde1 !important;
            margin: 0 auto !important;
          }
          .docx-outer-wrapper p {
            margin-bottom: 0.5em !important;
          }
        `}} />

        {/* Word Header bar */}
        <div className="bg-[#2b579a] text-white px-4 py-2 flex items-center justify-between shadow-sm shrink-0 select-none">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold truncate max-w-sm">{fileName}</span>
          </div>
          {documentId && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 bg-white text-[#2b579a] hover:bg-slate-100 transition px-3 py-1 rounded text-xs font-bold shadow-sm cursor-pointer"
            >
              <Edit2 className="h-3 w-3" />
              Edit Content
            </button>
          )}
        </div>

        {/* Preview Container / Fallback */}
        <div className="flex-1 overflow-auto py-6 px-4 relative">
          {loading && (
            <div className="absolute inset-0 grid place-items-center bg-[#f8f9ff]/90 z-20">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#3525cd]" />
                <p className="mt-3 text-sm font-semibold text-[#74798a]">
                  Rendering Word document...
                </p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="absolute inset-0 grid place-items-center bg-[#f8f9ff] z-20 p-6 text-center">
              <div>
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-4 text-lg font-bold text-[#1f2229]">Unable to Preview</h3>
                <p className="mt-2 text-sm text-[#74798a] max-w-md">{error}</p>
              </div>
            </div>
          )}

          {useFallback && fallbackText ? (
            <div className="mx-auto max-w-[820px] bg-[#0b1c30] p-6 text-sm leading-7 text-slate-100 rounded-lg shadow-sm border border-[#c7c4d8]/20">
              <pre className="whitespace-pre-wrap font-mono">{fallbackText}</pre>
            </div>
          ) : (
            <div ref={containerRef} className="w-full flex justify-center" />
          )}
        </div>
      </div>
    )
  }

  if (type === 'xlsx') {
    const maxRows = Math.max(15, gridData.length)
    const maxCols = Math.max(8, gridData.reduce((max, row) => Math.max(max, row.length), 0))

    return (
      <div className="h-[620px] flex flex-col bg-[#f3f4f6] border-t border-b border-[#c7c4d8]/20 xlsx-preview-wrapper select-none">
        <style dangerouslySetInnerHTML={{ __html: `
          .xlsx-preview-wrapper .excel-table-container {
            flex: 1;
            overflow: auto;
            background: #ffffff;
            width: 100%;
          }
          .xlsx-preview-wrapper table {
            border-collapse: collapse;
            font-size: 13px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333333;
          }
          .xlsx-preview-wrapper th, .xlsx-preview-wrapper td {
            border: 1px solid #d4d4d4 !important;
            padding: 6px 10px !important;
            min-width: 80px;
            height: 24px;
            vertical-align: middle;
          }
          /* Style index headers similar to real Excel grid lines */
          .xlsx-preview-wrapper table tr:first-child td,
          .xlsx-preview-wrapper table tr td:first-child {
            background-color: #f1f3f4;
            font-weight: bold;
            text-align: center;
            color: #5f6368;
            font-size: 11px;
            border: 1px solid #c0c0c0 !important;
          }
          .xlsx-preview-wrapper .excel-sheets-footer {
            display: flex;
            align-items: center;
            background-color: #f8f9fa;
            border-top: 1px solid #d4d4d4;
            height: 40px;
            padding-left: 16px;
            width: 100%;
            overflow-x: auto;
          }
          .xlsx-preview-wrapper .excel-sheet-tab {
            height: 100%;
            display: flex;
            align-items: center;
            padding: 0 16px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            border-right: 1px solid #e2e8f0;
            background-color: #f8f9fa;
            color: #5f6368;
            user-select: none;
            transition: all 0.15s ease;
            border-bottom: 3px solid transparent;
          }
          .xlsx-preview-wrapper .excel-sheet-tab.active {
            background-color: #ffffff;
            color: #107c41;
            border-bottom: 3px solid #107c41;
            font-weight: bold;
          }
          .xlsx-preview-wrapper .excel-sheet-tab:hover:not(.active) {
            background-color: #eff1f3;
            color: #1e293b;
          }
        `}} />

        {/* Excel Header bar */}
        <div className="bg-[#107c41] text-white px-4 py-2 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold truncate max-w-sm">{fileName}</span>
          </div>
          <div className="flex items-center gap-2">
            {saveError && <span className="text-xs text-red-200 font-medium mr-2">{saveError}</span>}
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 bg-white text-[#107c41] hover:bg-slate-100 transition px-3 py-1 rounded text-xs font-bold shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setSaveError(null)
                    if (workbook && activeSheet) {
                      const sheet = workbook.Sheets[activeSheet]
                      const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
                      setGridData(aoa)
                    }
                  }}
                  disabled={saving}
                  className="inline-flex items-center bg-[#0b592e] text-white hover:bg-[#073c1f] transition px-3 py-1 rounded text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
              </>
            ) : (
              documentId && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 bg-white text-[#107c41] hover:bg-slate-100 transition px-3 py-1 rounded text-xs font-bold shadow-sm cursor-pointer"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit Content
                </button>
              )
            )}
          </div>
        </div>

        {/* Spreadsheet container */}
        <div className="excel-table-container">
          {isEditing ? (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="bg-[#f1f3f4] w-10 border border-[#c0c0c0] text-[11px] font-bold text-center text-slate-500 py-1"></th>
                  {Array.from({ length: maxCols }).map((_, cIdx) => (
                    <th key={cIdx} className="bg-[#f1f3f4] font-bold text-center text-slate-500 select-none text-[11px] border border-[#c0c0c0] !py-1">
                      {getColLetter(cIdx)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxRows }).map((_, rIdx) => (
                  <tr key={rIdx}>
                    <td className="bg-[#f1f3f4] font-bold text-center text-slate-500 w-10 select-none text-[11px] border border-[#c0c0c0] !p-0 h-6">
                      {rIdx + 1}
                    </td>
                    {Array.from({ length: maxCols }).map((_, cIdx) => {
                      const val = (gridData[rIdx] && gridData[rIdx][cIdx]) || ''
                      return (
                        <td key={cIdx} className="!p-0 border border-[#d4d4d4] h-6 min-w-[80px]">
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                            className="w-full h-full border-0 outline-none px-2 text-xs text-slate-800 focus:bg-indigo-50/40 select-text"
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div 
              dangerouslySetInnerHTML={{ __html: sheetHtml }} 
              className="inline-block min-w-full"
            />
          )}
        </div>

        {/* Sheet Tabs Selector at bottom */}
        {sheets.length > 0 && (
          <div className="excel-sheets-footer">
            {sheets.map((sheetName) => (
              <div
                key={sheetName}
                onClick={() => {
                  if (!saving) {
                    setActiveSheet(sheetName)
                  }
                }}
                className={`excel-sheet-tab ${activeSheet === sheetName ? 'active' : ''}`}
              >
                {sheetName}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
}
