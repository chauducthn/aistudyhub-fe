import React, { useEffect, useRef, useState } from 'react'
import * as docx from 'docx-preview'
import * as XLSX from 'xlsx'
import { Loader2, AlertCircle, FileSpreadsheet, FileText } from 'lucide-react'

export default function OfficePreviewer({ previewUrl, blob, type, fileName, fallbackText }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useFallback, setUseFallback] = useState(false)
  const [debugLogs, setDebugLogs] = useState([])
  
  // Excel states
  const [workbook, setWorkbook] = useState(null)
  const [sheets, setSheets] = useState([])
  const [activeSheet, setActiveSheet] = useState('')
  const [sheetHtml, setSheetHtml] = useState('')

  const containerRef = useRef(null)

  const addLog = (msg) => {
    console.log(`[OfficePreviewer Debug] ${msg}`)
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
  }

  useEffect(() => {
    let isMounted = true

    async function loadPreview() {
      setLoading(true)
      setError(null)
      setUseFallback(false)
      setDebugLogs([])
      try {
        addLog(`loadPreview invoked. Type: ${type}, FileName: ${fileName}`)
        let activeBlob = blob
        if (!activeBlob) {
          addLog('Blob prop is absent, fetching from previewUrl...')
          const response = await fetch(previewUrl)
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
            const renderFn = docx.renderAsync;
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
                breakPages: true
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
  }, [previewUrl, blob, type, fallbackText])

  // Update Excel active sheet html table
  useEffect(() => {
    if (type === 'xlsx' && workbook && activeSheet) {
      const sheet = workbook.Sheets[activeSheet]
      // sheet_to_html outputs standard HTML table representation
      const html = XLSX.utils.sheet_to_html(sheet)
      setSheetHtml(html)
    }
  }, [workbook, activeSheet, type])

  // Early return for loading and error ONLY for XLSX type
  if (type === 'xlsx') {
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
    if (useFallback && fallbackText) {
      return (
        <div className="h-[620px] overflow-auto bg-[#0b1c30] p-6 text-sm leading-7 text-slate-100 border-t border-b border-[#c7c4d8]/20">
          <pre className="whitespace-pre-wrap font-mono">{fallbackText}</pre>
        </div>
      )
    }
    return (
      <div className="h-[620px] overflow-auto bg-[#f0f1f5] border-t border-b border-[#c7c4d8]/20 flex flex-col items-center py-6 px-4 docx-outer-wrapper relative">
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

        {/* Loading Overlay */}
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

        {/* Error Overlay */}
        {error && !loading && (
          <div className="absolute inset-0 grid place-items-center bg-[#f8f9ff] z-20 p-6 text-center">
            <div>
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-4 text-lg font-bold text-[#1f2229]">Unable to Preview</h3>
              <p className="mt-2 text-sm text-[#74798a] max-w-md">{error}</p>
            </div>
          </div>
        )}
        
        <div ref={containerRef} className="w-full flex justify-center" />
      </div>
    )
  }

  if (type === 'xlsx') {
    return (
      <div className="h-[620px] flex flex-col bg-[#f3f4f6] border-t border-b border-[#c7c4d8]/20 xlsx-preview-wrapper select-none">
        <style dangerouslySetInnerHTML={{ __html: `
          .xlsx-preview-wrapper .excel-table-container {
            flex: 1;
            overflow: auto;
            background: #ffffff;
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
        `}} />

        {/* Excel Header bar */}
        <div className="bg-[#107c41] text-white px-4 py-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold truncate max-w-sm">{fileName}</span>
          </div>
          <div className="bg-[#0b592e] px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
            Excel View
          </div>
        </div>

        {/* Spreadsheet container */}
        <div className="excel-table-container p-4">
          <div 
            dangerouslySetInnerHTML={{ __html: sheetHtml }} 
            className="inline-block min-w-full"
          />
        </div>

        {/* Sheet Tabs Selector at bottom */}
        {sheets.length > 1 && (
          <div className="bg-[#f3f4f6] border-t border-gray-300 px-4 py-2 flex items-center gap-1.5 overflow-x-auto select-none">
            <span className="text-[11px] font-bold text-gray-500 mr-2 uppercase tracking-wide">Sheets:</span>
            {sheets.map(sheetName => (
              <button
                key={sheetName}
                onClick={() => setActiveSheet(sheetName)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all shadow-sm ${
                  activeSheet === sheetName
                    ? 'bg-white text-[#107c41] border border-gray-300 font-bold'
                    : 'bg-[#e1e2e5] text-gray-700 hover:bg-gray-200 hover:text-black border border-transparent'
                }`}
              >
                {sheetName}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
}
