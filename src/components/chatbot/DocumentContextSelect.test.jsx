import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import DocumentContextSelect from './DocumentContextSelect'

function renderSelect(props) {
  return render(
    <MemoryRouter>
      <DocumentContextSelect {...props} />
    </MemoryRouter>,
  )
}

describe('DocumentContextSelect', () => {
  it('uses original file names and disambiguates duplicate documents', () => {
    const onDocumentIdChange = vi.fn()
    const documents = [
      {
        id: '81',
        title: 'Tài liệu học',
        fileName: '04_bang_theo_doi_tien_do_hoc_tap.xlsx',
        subjectName: 'Cấu trúc dữ liệu',
        source: 'mine',
        extractionStatus: 'EXTRACTED',
      },
      {
        id: '82',
        title: 'Tài liệu học',
        fileName: '05_thong_bao_lich_thi_va_ho_tro.txt',
        source: 'mine',
        extractionStatus: 'EXTRACTED',
      },
      {
        id: '90',
        title: 'Public sheet',
        fileName: '04_bang_theo_doi_tien_do_hoc_tap.xlsx',
        source: 'public',
        extractionStatus: 'EXTRACTED',
      },
    ]

    renderSelect({ documents, documentId: '', onDocumentIdChange })

    fireEvent.focus(screen.getByRole('combobox', { name: 'Search documents' }))
    expect(screen.getByRole('listbox', { name: 'Document search results' })).toBeInTheDocument()
    expect(
      screen.getByRole('option', {
        name: /04_bang_theo_doi_tien_do_hoc_tap\.xlsx/,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', {
        name: /05_thong_bao_lich_thi_va_ho_tro\.txt/,
      }),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: 'Search documents' }), {
      target: { value: '05_thong_bao' },
    })
    expect(screen.getByText('1/2 my documents')).toBeInTheDocument()
    expect(
      screen.queryByRole('option', {
        name: /04_bang_theo_doi_tien_do_hoc_tap\.xlsx/,
      }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('option', { name: /05_thong_bao_lich_thi_va_ho_tro\.txt/ }))
    expect(onDocumentIdChange).toHaveBeenCalledWith('82')
  })

  it('searches public documents only on demand after two characters', async () => {
    vi.useFakeTimers()
    const onSearchPublicDocuments = vi.fn()
    renderSelect({
      documents: [
          {
            id: '90',
            title: 'Binary Search',
            fileName: 'binary-search.pdf',
            userId: 7,
            uploaderName: 'Current User Name',
            source: 'public',
            extractionStatus: 'EXTRACTED',
          },
      ],
      documentId: '',
      onDocumentIdChange: vi.fn(),
      onSearchPublicDocuments,
      currentUserId: 7,
    })

    fireEvent.change(screen.getByRole('combobox', { name: 'Filter by source' }), {
      target: { value: 'public' },
    })
    expect(screen.getByText('Enter at least 2 characters to search public documents.')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: 'Search documents' }), {
      target: { value: 'binary' },
    })
    await act(async () => vi.advanceTimersByTime(350))

    expect(onSearchPublicDocuments).toHaveBeenLastCalledWith('binary')
    expect(screen.getByRole('option', { name: /binary-search\.pdf/ })).toBeInTheDocument()
    expect(screen.getByText(/Binary Search · You · Public/)).toBeInTheDocument()
    expect(screen.queryByText(/Current User Name/)).not.toBeInTheDocument()
    vi.useRealTimers()
  })
})
