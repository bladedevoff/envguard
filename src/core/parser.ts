export function parse(input: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = input.split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const stripped = line.startsWith('export ') ? line.slice(7) : line
    const eqIndex = stripped.indexOf('=')
    if (eqIndex === -1) continue

    const key = stripped.slice(0, eqIndex).trim()
    result[key] = parseValue(stripped.slice(eqIndex + 1))
  }

  return result
}

function parseValue(raw: string): string {
  const trimmed = raw.trim()

  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1)
  }

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\([nrt"\\])/g, (_, ch) => {
      const map: Record<string, string> = { n: '\n', r: '\r', t: '\t', '"': '"', '\\': '\\' }
      return map[ch] ?? ch
    })
  }

  const commentIndex = trimmed.indexOf(' #')
  if (commentIndex !== -1) {
    return trimmed.slice(0, commentIndex).trim()
  }

  return trimmed
}
