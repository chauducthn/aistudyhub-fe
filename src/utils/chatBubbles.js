export function expandToBubbles(record) {
  const bubbles = []
  if (record.message) {
    bubbles.push({
      key: `${record.id}-u`,
      role: 'user',
      text: record.message,
      at: record.createdAt,
    })
  }
  if (record.response) {
    bubbles.push({
      key: `${record.id}-b`,
      role: 'bot',
      text: record.response,
      at: record.createdAt,
      documentTitle: record.documentTitle,
      model: record.model,
    })
  }
  return bubbles
}

export function recordsToBubbles(records) {
  return [...records].reverse().flatMap(expandToBubbles)
}
