import { describe, it, expect } from 'vitest'
import { formatCheckResult } from '../../src/cli/reporter'

describe('formatCheckResult', () => {
  it('shows success when no errors', () => {
    expect(formatCheckResult([], 3)).toContain('all 3 variables OK')
  })

  it('shows errors with counts', () => {
    const result = formatCheckResult(
      [
        { key: 'DB', message: 'required but missing' },
        { key: 'LONG_KEY', message: 'invalid' },
      ],
      5,
    )
    expect(result).toContain('2 problems found')
    expect(result).toContain('3 variables OK, 2 failed')
  })
})
