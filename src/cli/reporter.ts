import type { ValidationError } from '../core/types'

export function formatCheckResult(errors: ValidationError[], total: number): string {
  if (errors.length === 0) return `\n✓ envguard: all ${total} variables OK\n`

  const pad = Math.max(...errors.map(e => e.key.length))
  const lines = errors.map(e => `  ${e.key.padEnd(pad)}  ✗ ${e.message}`)
  const passed = total - errors.length

  return [
    '',
    `✗ envguard: ${errors.length} problem${errors.length > 1 ? 's' : ''} found`,
    '',
    ...lines,
    '',
    `  ${passed} variable${passed !== 1 ? 's' : ''} OK, ${errors.length} failed`,
    '',
  ].join('\n')
}
