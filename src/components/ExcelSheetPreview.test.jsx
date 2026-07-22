import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ExcelSheetPreview from './ExcelSheetPreview'

const xmlFile = (content) => ({ content: new TextEncoder().encode(content) })

describe('ExcelSheetPreview', () => {
  it('renders workbook styles, merged cells, dimensions and an embedded column chart', () => {
    const workbook = {
      SheetNames: ['Dashboard'],
      Sheets: {
        Dashboard: {
          '!ref': 'A1:B5',
          '!merges': [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }],
          '!cols': [{ wpx: 120 }, { wpx: 90 }],
          '!rows': [{ hpx: 40 }],
          A1: { t: 's', v: 'Dashboard', w: 'Dashboard' },
          A2: { t: 's', v: 'Good', w: 'Good' },
          B2: { t: 'n', v: 3, w: '3' },
          A3: { t: 's', v: 'Support', w: 'Support' },
          B3: { t: 'n', v: 1, w: '1' },
        },
      },
      Directory: { sheets: ['/xl/worksheets/sheet1.xml'] },
      files: {
        'xl/styles.xml': xmlFile(`
          <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
            <fonts count="2">
              <font><sz val="11"/><name val="Arial"/></font>
              <font><b/><sz val="20"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>
            </fonts>
            <fills count="2">
              <fill><patternFill patternType="none"/></fill>
              <fill><patternFill patternType="solid"><fgColor rgb="FF0B2545"/></patternFill></fill>
            </fills>
            <borders count="1"><border/></borders>
            <cellXfs count="2">
              <xf fontId="0" fillId="0" borderId="0"/>
              <xf fontId="1" fillId="1" borderId="0"><alignment horizontal="center"/></xf>
            </cellXfs>
          </styleSheet>
        `),
        'xl/worksheets/sheet1.xml': xmlFile(`
          <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
            <sheetData><row r="1"><c r="A1" s="1"/></row></sheetData>
            <drawing r:id="rId1"/>
          </worksheet>
        `),
        'xl/worksheets/_rels/sheet1.xml.rels': xmlFile(`
          <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
            <Relationship Id="rId1" Target="../drawings/drawing1.xml"/>
          </Relationships>
        `),
        'xl/drawings/drawing1.xml': xmlFile(`
          <xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing"
            xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
            <xdr:twoCellAnchor>
              <xdr:from><xdr:col>0</xdr:col><xdr:row>1</xdr:row></xdr:from>
              <xdr:to><xdr:col>2</xdr:col><xdr:row>5</xdr:row></xdr:to>
              <xdr:graphicFrame><c:chart r:id="rId2"/></xdr:graphicFrame>
            </xdr:twoCellAnchor>
          </xdr:wsDr>
        `),
        'xl/drawings/_rels/drawing1.xml.rels': xmlFile(`
          <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
            <Relationship Id="rId2" Target="charts/chart1.xml"/>
          </Relationships>
        `),
        'xl/drawings/charts/chart1.xml': xmlFile(`
          <c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <c:chart>
              <c:title><c:tx><c:rich><a:p><a:r><a:t>Learning summary</a:t></a:r></a:p></c:rich></c:tx></c:title>
              <c:plotArea><c:barChart><c:ser>
                <c:tx><c:v>Students</c:v></c:tx>
                <c:cat><c:strRef><c:f>'Dashboard'!$A$2:$A$3</c:f><c:strCache>
                  <c:ptCount val="0"/>
                </c:strCache></c:strRef></c:cat>
                <c:val><c:numRef><c:f>'Dashboard'!$B$2:$B$3</c:f><c:numCache>
                  <c:ptCount val="0"/>
                </c:numCache></c:numRef></c:val>
              </c:ser></c:barChart></c:plotArea>
            </c:chart>
          </c:chartSpace>
        `),
      },
    }

    render(<ExcelSheetPreview workbook={workbook} activeSheet="Dashboard" />)

    const titleCell = screen.getByText('Dashboard').closest('td')
    expect(titleCell).toHaveAttribute('colspan', '2')
    expect(titleCell).toHaveStyle({ backgroundColor: '#0B2545', color: '#FFFFFF' })
    expect(screen.getByRole('img', { name: 'Learning summary' })).toBeInTheDocument()
  })
})
