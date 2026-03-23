import { describe, it, expect } from 'vitest'
import { generateSchema } from '../../src/cli/commands/init'

describe('generateSchema', () => {
  it('infers port type', () => {
    expect(generateSchema({ PORT: '3000' })).toContain('t.port()')
  })

  it('infers url type', () => {
    expect(generateSchema({ DATABASE_URL: 'https://db.example.com' })).toContain('t.url()')
  })

  it('infers boolean type', () => {
    expect(generateSchema({ DEBUG: 'true' })).toContain('t.boolean()')
  })

  it('infers number type', () => {
    expect(generateSchema({ TIMEOUT: '5000' })).toContain('t.number()')
  })

  it('defaults to t.string()', () => {
    expect(generateSchema({ FOO: 'bar' })).toContain('t.string()')
  })

  it('marks secret patterns', () => {
    expect(generateSchema({ API_KEY: 'sk-abc123' })).toContain('secret: true')
  })

  it('generates valid import', () => {
    expect(generateSchema({ FOO: 'bar' })).toContain("import { envguard, t } from 'envguard'")
  })
})
