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
  // The session API already returns messages oldest-first. Reversing here made
  // every conversation appear newest-first whenever a session was reopened.
  return records.flatMap(expandToBubbles)
}
