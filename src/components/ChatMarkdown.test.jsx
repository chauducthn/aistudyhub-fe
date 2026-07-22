import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ChatMarkdown from './ChatMarkdown'

describe('ChatMarkdown', () => {
  it('keeps bullet markers aligned with loose-list paragraphs', () => {
    const { container } = render(
      <ChatMarkdown>{'- **Trung thực và sự đồng thuận:** Nội dung thứ nhất.\n\n- **Ranh giới:** Nội dung thứ hai.'}</ChatMarkdown>,
    )

    const markdown = container.querySelector('.chat-markdown')
    const items = screen.getAllByRole('listitem')

    expect(markdown).not.toHaveClass('whitespace-pre-wrap')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveClass('[&>p]:my-0')
    expect(items[0].querySelector('p')).toHaveTextContent('Trung thực và sự đồng thuận: Nội dung thứ nhất.')
  })
})
