import { describe, expect, it } from 'vitest'
import { recordsToBubbles } from './chatBubbles'

describe('recordsToBubbles', () => {
  it('preserves the oldest-first order returned by the session API', () => {
    const records = [
      {
        id: '10',
        message: 'First question',
        response: 'First answer',
        createdAt: '2026-07-20T10:00:00Z',
      },
      {
        id: '11',
        message: 'Follow-up question',
        response: 'Follow-up answer',
        createdAt: '2026-07-20T10:01:00Z',
      },
    ]

    expect(recordsToBubbles(records).map((bubble) => bubble.text)).toEqual([
      'First question',
      'First answer',
      'Follow-up question',
      'Follow-up answer',
    ])
  })

  it('does not mutate the API response array', () => {
    const records = [{ id: '1', message: 'Question', response: 'Answer' }]
    const snapshot = [...records]

    recordsToBubbles(records)

    expect(records).toEqual(snapshot)
  })
})
