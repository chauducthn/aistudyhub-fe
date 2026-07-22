import { useMemo } from 'react'
import * as XLSX from 'xlsx'

const DEFAULT_COLUMN_WIDTH = 96
const DEFAULT_ROW_HEIGHT = 24
const ROW_HEADER_WIDTH = 46
const COLUMN_HEADER_HEIGHT = 28
const CHART_COLORS = ['#1f6a8a', '#3d8dff', '#16a34a', '#dc2626', '#7c3aed']

export default function ExcelSheetPreview({ workbook, activeSheet }) {
  const model = useMemo(
    () => buildSheetModel(workbook, activeSheet),
    [workbook, activeSheet],
  )

  if (!model) return null

  return (
    <div className="relative inline-block min-w-full bg-white">
      <table className="excel-sheet-table">
        <colgroup>
          <col style={{ width: ROW_HEADER_WIDTH }} />
          {model.columnWidths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <thead>
          <tr style={{ height: COLUMN_HEADER_HEIGHT }}>
            <th className="excel-corner-cell" />
            {model.columnWidths.map((_, columnIndex) => (
              <th key={columnIndex} className="excel-column-header">
                {XLSX.utils.encode_col(model.range.s.c + columnIndex)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {model.rows.map((row) => (
            <tr key={row.rowIndex} style={{ height: row.height }}>
              <th className="excel-row-header">{row.rowIndex + 1}</th>
              {row.cells.map((cell) => (
                <td
                  key={cell.address}
                  rowSpan={cell.rowSpan}
                  colSpan={cell.colSpan}
                  style={cell.style}
                  title={cell.formula ? `=${cell.formula}` : undefined}
                >
                  {cell.displayValue}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {model.charts.map((chart, index) => (
        <ExcelChart key={`${chart.title}-${index}`} chart={chart} />
      ))}
    </div>
  )
}

function ExcelChart({ chart }) {
  const width = 640
  const height = 340
  const plot = { left: 48, top: 46, right: 20, bottom: 52 }
  const plotWidth = width - plot.left - plot.right
  const plotHeight = height - plot.top - plot.bottom
  const maxValue = Math.max(1, ...chart.series.flatMap((series) => series.values))
  const roundedMax = Math.ceil(maxValue / 10) * 10
  const categoryCount = Math.max(1, chart.categories.length)
  const seriesCount = Math.max(1, chart.series.length)
  const groupWidth = plotWidth / categoryCount
  const barWidth = Math.min(62, (groupWidth * 0.68) / seriesCount)

  return (
    <div
      className="excel-chart-overlay"
      style={{ left: chart.left, top: chart.top, width: chart.width, height: chart.height }}
    >
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={chart.title}>
        <rect width={width} height={height} fill="#ffffff" />
        <text x={width / 2} y="27" textAnchor="middle" fontSize="22" fill="#111827">
          {chart.title}
        </text>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = plot.top + plotHeight * (1 - ratio)
          return (
            <g key={ratio}>
              <line
                x1={plot.left}
                x2={plot.left + plotWidth}
                y1={y}
                y2={y}
                stroke="#d1d5db"
                strokeDasharray="4 4"
              />
              <text x={plot.left - 8} y={y + 4} textAnchor="end" fontSize="12" fill="#374151">
                {Math.round(roundedMax * ratio)}
              </text>
            </g>
          )
        })}

        <line
          x1={plot.left}
          x2={plot.left + plotWidth}
          y1={plot.top + plotHeight}
          y2={plot.top + plotHeight}
          stroke="#111827"
          strokeWidth="1.5"
        />

        {chart.categories.map((category, categoryIndex) => {
          const groupStart = plot.left + categoryIndex * groupWidth
          return (
            <g key={`${category}-${categoryIndex}`}>
              {chart.series.map((series, seriesIndex) => {
                const value = Number(series.values[categoryIndex] || 0)
                const barHeight = (value / roundedMax) * plotHeight
                const x = groupStart
                  + (groupWidth - barWidth * seriesCount) / 2
                  + seriesIndex * barWidth
                const y = plot.top + plotHeight - barHeight
                return (
                  <rect
                    key={`${series.name}-${seriesIndex}`}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={CHART_COLORS[seriesIndex % CHART_COLORS.length]}
                  />
                )
              })}
              <text
                x={groupStart + groupWidth / 2}
                y={plot.top + plotHeight + 25}
                textAnchor="middle"
                fontSize="12"
                fill="#374151"
              >
                {category}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function buildSheetModel(workbook, sheetName) {
  const sheet = workbook?.Sheets?.[sheetName]
  if (!sheet || !sheet['!ref']) return null

  const range = XLSX.utils.decode_range(sheet['!ref'])
  const sheetIndex = workbook.SheetNames.indexOf(sheetName)
  const sheetPath = normalizePackagePath(workbook.Directory?.sheets?.[sheetIndex])
  const rawStyles = parseWorkbookStyles(workbook)
  const styleIndexes = parseCellStyleIndexes(workbook, sheetPath)
  const mergeLookup = createMergeLookup(sheet['!merges'] || [])
  const columnWidths = []
  const rowHeights = []

  for (let column = range.s.c; column <= range.e.c; column += 1) {
    const config = sheet['!cols']?.[column]
    columnWidths.push(Math.max(54, Math.round(config?.wpx || (config?.wch ? config.wch * 7 : DEFAULT_COLUMN_WIDTH))))
  }

  for (let row = range.s.r; row <= range.e.r; row += 1) {
    const config = sheet['!rows']?.[row]
    rowHeights.push(Math.max(22, Math.round(config?.hpx || config?.hpt || DEFAULT_ROW_HEIGHT)))
  }

  const rows = []
  for (let row = range.s.r; row <= range.e.r; row += 1) {
    const cells = []
    for (let column = range.s.c; column <= range.e.c; column += 1) {
      const address = XLSX.utils.encode_cell({ r: row, c: column })
      const merge = mergeLookup.get(address)
      if (merge?.skip) continue

      const cell = sheet[address]
      const styleIndex = styleIndexes[address] ?? 0
      const style = rawStyles[styleIndex] || {}
      cells.push({
        address,
        displayValue: formatCellValue(cell),
        formula: cell?.f,
        rowSpan: merge?.rowSpan || 1,
        colSpan: merge?.colSpan || 1,
        style,
      })
    }
    rows.push({ rowIndex: row, height: rowHeights[row - range.s.r], cells })
  }

  return {
    range,
    columnWidths,
    rowHeights,
    rows,
    charts: parseSheetCharts(workbook, sheetPath, range, columnWidths, rowHeights),
  }
}

function formatCellValue(cell) {
  if (!cell || cell.t === 'z') return ''
  if (cell.w != null) return String(cell.w)
  if (cell.v instanceof Date) return cell.v.toLocaleDateString()
  return cell.v == null ? '' : String(cell.v)
}

function createMergeLookup(merges) {
  const lookup = new Map()
  merges.forEach((merge) => {
    for (let row = merge.s.r; row <= merge.e.r; row += 1) {
      for (let column = merge.s.c; column <= merge.e.c; column += 1) {
        const address = XLSX.utils.encode_cell({ r: row, c: column })
        if (row === merge.s.r && column === merge.s.c) {
          lookup.set(address, {
            rowSpan: merge.e.r - merge.s.r + 1,
            colSpan: merge.e.c - merge.s.c + 1,
          })
        } else {
          lookup.set(address, { skip: true })
        }
      }
    }
  })
  return lookup
}

function parseWorkbookStyles(workbook) {
  const xml = readWorkbookFile(workbook, 'xl/styles.xml')
  if (!xml) return []

  const document = parseXml(xml)
  const fonts = directChildren(firstByLocalName(document, 'fonts'), 'font').map(parseFont)
  const fills = directChildren(firstByLocalName(document, 'fills'), 'fill').map(parseFill)
  const borders = directChildren(firstByLocalName(document, 'borders'), 'border').map(parseBorder)
  const xfs = directChildren(firstByLocalName(document, 'cellXfs'), 'xf')

  return xfs.map((xf) => {
    const font = fonts[Number(xf.getAttribute('fontId') || 0)] || {}
    const fill = fills[Number(xf.getAttribute('fillId') || 0)] || {}
    const border = borders[Number(xf.getAttribute('borderId') || 0)] || {}
    const alignment = directChildren(xf, 'alignment')[0]
    return {
      ...font,
      ...fill,
      ...border,
      textAlign: alignment?.getAttribute('horizontal') || undefined,
      verticalAlign: normalizeVerticalAlignment(alignment?.getAttribute('vertical')),
      whiteSpace: alignment?.getAttribute('wrapText') === '1' ? 'normal' : 'nowrap',
    }
  })
}

function parseFont(font) {
  const color = directChildren(font, 'color')[0]
  const size = Number(directChildren(font, 'sz')[0]?.getAttribute('val') || 11)
  const family = directChildren(font, 'name')[0]?.getAttribute('val')
  return {
    color: parseColor(color) || undefined,
    fontSize: `${size}pt`,
    fontFamily: family ? `'${family}', 'Segoe UI', sans-serif` : undefined,
    fontWeight: directChildren(font, 'b').length ? 700 : undefined,
    fontStyle: directChildren(font, 'i').length ? 'italic' : undefined,
  }
}

function parseFill(fill) {
  const patternFill = directChildren(fill, 'patternFill')[0]
  if (!patternFill || patternFill.getAttribute('patternType') !== 'solid') return {}
  const color = parseColor(directChildren(patternFill, 'fgColor')[0])
  return color ? { backgroundColor: color } : {}
}

function parseBorder(border) {
  const style = {}
  ;['top', 'right', 'bottom', 'left'].forEach((side) => {
    const node = directChildren(border, side)[0]
    if (!node?.getAttribute('style')) return
    const color = parseColor(directChildren(node, 'color')[0]) || '#cbd5e1'
    style[`border${side[0].toUpperCase()}${side.slice(1)}`] = `1px solid ${color}`
  })
  return style
}

function parseColor(node) {
  const raw = node?.getAttribute('rgb')
  if (!raw) return null
  const rgb = raw.length === 8 ? raw.slice(2) : raw
  return `#${rgb}`
}

function normalizeVerticalAlignment(value) {
  if (value === 'center') return 'middle'
  if (value === 'top' || value === 'bottom') return value
  return undefined
}

function parseCellStyleIndexes(workbook, sheetPath) {
  const xml = readWorkbookFile(workbook, sheetPath)
  if (!xml) return {}
  const document = parseXml(xml)
  const indexes = {}
  allByLocalName(document, 'c').forEach((cell) => {
    const address = cell.getAttribute('r')
    if (address) indexes[address] = Number(cell.getAttribute('s') || 0)
  })
  return indexes
}

function parseSheetCharts(workbook, sheetPath, range, columnWidths, rowHeights) {
  if (!sheetPath) return []
  const sheetXml = readWorkbookFile(workbook, sheetPath)
  if (!sheetXml) return []
  const sheetDocument = parseXml(sheetXml)
  const drawingNode = firstByLocalName(sheetDocument, 'drawing')
  const drawingRelationshipId = relationshipId(drawingNode)
  if (!drawingRelationshipId) return []

  const sheetRelationships = parseRelationships(workbook, relationshipPath(sheetPath), sheetPath)
  const drawingPath = sheetRelationships[drawingRelationshipId]
  const drawingXml = readWorkbookFile(workbook, drawingPath)
  if (!drawingXml) return []

  const drawingDocument = parseXml(drawingXml)
  const drawingRelationships = parseRelationships(workbook, relationshipPath(drawingPath), drawingPath)
  const anchors = [
    ...allByLocalName(drawingDocument, 'twoCellAnchor'),
    ...allByLocalName(drawingDocument, 'oneCellAnchor'),
  ]

  return anchors.flatMap((anchor) => {
    const chartNode = firstByLocalName(anchor, 'chart')
    const chartRelationshipId = relationshipId(chartNode)
    const chartPath = drawingRelationships[chartRelationshipId]
    const chartXml = readWorkbookFile(workbook, chartPath)
    if (!chartXml) return []

    const from = parseAnchorPoint(firstDirectChild(anchor, 'from'))
    const to = parseAnchorPoint(firstDirectChild(anchor, 'to'))
    if (!from || !to) return []
    const chartData = parseChartXml(chartXml, workbook)
    if (!chartData.series.length || !chartData.categories.length) return []

    const startColumn = Math.max(from.column, range.s.c)
    const startRow = Math.max(from.row, range.s.r)
    const endColumn = Math.min(to.column, range.e.c + 1)
    const endRow = Math.min(to.row, range.e.r + 1)
    const left = ROW_HEADER_WIDTH + sumDimensions(columnWidths, range.s.c, range.s.c, startColumn)
    const top = COLUMN_HEADER_HEIGHT + sumDimensions(rowHeights, range.s.r, range.s.r, startRow)
    const width = Math.max(300, sumDimensions(columnWidths, range.s.c, startColumn, endColumn))
    const height = Math.max(220, sumDimensions(rowHeights, range.s.r, startRow, endRow))

    return [{ ...chartData, left, top, width, height }]
  })
}

function parseChartXml(xml, workbook) {
  const document = parseXml(xml)
  const titleNode = firstByLocalName(document, 'title')
  const title = allByLocalName(titleNode, 't').map((node) => node.textContent).join('') || 'Chart'
  const series = allByLocalName(document, 'ser').map((seriesNode, index) => {
    const tx = firstDirectChild(seriesNode, 'tx')
    const name = allByLocalName(tx, 'v')[0]?.textContent || `Series ${index + 1}`
    const valuesNode = firstDirectChild(seriesNode, 'val') || firstDirectChild(seriesNode, 'yVal')
    return { name, values: chartPointValues(valuesNode, workbook).map(Number) }
  })
  const firstSeries = allByLocalName(document, 'ser')[0]
  const categoryNode = firstDirectChild(firstSeries, 'cat') || firstDirectChild(firstSeries, 'xVal')
  const categories = chartPointValues(categoryNode, workbook)
  return { title, series, categories }
}

function chartPointValues(node, workbook) {
  const cachedValues = cachedPointValues(node)
  if (cachedValues.length) return cachedValues

  const formula = firstByLocalName(node, 'f')?.textContent
  return resolveWorkbookRangeValues(workbook, formula)
}

function cachedPointValues(node) {
  if (!node) return []
  return allByLocalName(node, 'pt')
    .sort((a, b) => Number(a.getAttribute('idx') || 0) - Number(b.getAttribute('idx') || 0))
    .map((point) => firstByLocalName(point, 'v')?.textContent || '')
}

function resolveWorkbookRangeValues(workbook, formula = '') {
  const match = formula.match(/^(?:'((?:[^']|'')+)'|([^!]+))!(.+)$/)
  if (!match) return []

  const sheetName = (match[1] || match[2] || '').replace(/''/g, "'")
  const sheet = workbook?.Sheets?.[sheetName]
  if (!sheet) return []

  try {
    const range = XLSX.utils.decode_range(match[3].replace(/\$/g, ''))
    const values = []
    for (let row = range.s.r; row <= range.e.r; row += 1) {
      for (let column = range.s.c; column <= range.e.c; column += 1) {
        const address = XLSX.utils.encode_cell({ r: row, c: column })
        values.push(formatCellValue(sheet[address]))
      }
    }
    return values
  } catch {
    return []
  }
}

function parseAnchorPoint(node) {
  if (!node) return null
  const column = Number(firstDirectChild(node, 'col')?.textContent)
  const row = Number(firstDirectChild(node, 'row')?.textContent)
  if (!Number.isFinite(column) || !Number.isFinite(row)) return null
  return { column, row }
}

function sumDimensions(values, origin, absoluteStart, absoluteEnd) {
  let total = 0
  for (let index = absoluteStart; index < absoluteEnd; index += 1) {
    total += values[index - origin] || DEFAULT_COLUMN_WIDTH
  }
  return total
}

function parseRelationships(workbook, relsPath, ownerPath) {
  const xml = readWorkbookFile(workbook, relsPath)
  if (!xml) return {}
  const document = parseXml(xml)
  const relationships = {}
  allByLocalName(document, 'Relationship').forEach((relationship) => {
    const id = relationship.getAttribute('Id')
    const target = relationship.getAttribute('Target')
    if (id && target) relationships[id] = resolvePackagePath(ownerPath, target)
  })
  return relationships
}

function relationshipPath(ownerPath) {
  if (!ownerPath) return ''
  const normalized = normalizePackagePath(ownerPath)
  const slash = normalized.lastIndexOf('/')
  const directory = slash >= 0 ? normalized.slice(0, slash) : ''
  const fileName = slash >= 0 ? normalized.slice(slash + 1) : normalized
  return `${directory}/_rels/${fileName}.rels`
}

function resolvePackagePath(ownerPath, target) {
  if (target.startsWith('/')) return normalizePackagePath(target)
  const base = normalizePackagePath(ownerPath).split('/')
  base.pop()
  target.split('/').forEach((part) => {
    if (!part || part === '.') return
    if (part === '..') base.pop()
    else base.push(part)
  })
  return base.join('/')
}

function normalizePackagePath(path = '') {
  return path.replace(/^\/+/, '').replace(/\\/g, '/')
}

function readWorkbookFile(workbook, path) {
  if (!path) return ''
  const normalized = normalizePackagePath(path)
  const file = workbook?.files?.[normalized] || workbook?.files?.[`/${normalized}`]
  if (!file?.content) return ''
  return new TextDecoder('utf-8').decode(file.content)
}

function parseXml(xml) {
  return new DOMParser().parseFromString(xml, 'application/xml')
}

function directChildren(node, localName) {
  if (!node) return []
  return Array.from(node.children || []).filter((child) => child.localName === localName)
}

function firstDirectChild(node, localName) {
  return directChildren(node, localName)[0]
}

function allByLocalName(node, localName) {
  if (!node) return []
  return Array.from(node.getElementsByTagNameNS('*', localName))
}

function firstByLocalName(node, localName) {
  return allByLocalName(node, localName)[0]
}

function relationshipId(node) {
  if (!node) return ''
  return Array.from(node.attributes || []).find((attribute) => attribute.localName === 'id')?.value || ''
}
