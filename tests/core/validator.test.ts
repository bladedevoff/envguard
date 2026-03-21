import { describe, it, expect } from 'vitest'
import { validate } from '../../src/core/validator'
import { t } from '../../src/core/schema'

describe('validate', () => {
  it('returns typed env object on success', () => {
    const schema = { PORT: t.port({ default: 3000 }), HOST: t.string() }
    const result = validate(schema, { HOST: 'localhost', PORT: '8080' })
    expect(result).toEqual({ ok: true, env: { HOST: 'localhost', PORT: 8080 } })
  })

  it('uses default when variable is missing', () => {
    const result = validate({ PORT: t.port({ default: 3000 }) }, {})
    expect(result).toEqual({ ok: true, env: { PORT: 3000 } })
  })

  it('reports error for missing required variable', () => {
    const result = validate({ DB_URL: t.url() }, {})
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toEqual({ key: 'DB_URL', message: 'required but missing' })
    }
  })

  it('reports error for invalid value', () => {
    const result = validate({ PORT: t.port() }, { PORT: 'abc' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors[0].key).toBe('PORT')
      expect(result.errors[0].received).toBe('abc')
    }
  })

  it('collects multiple errors', () => {
    const schema = { DB_URL: t.url(), PORT: t.port(), NODE_ENV: t.enum(['dev', 'prod']) }
    const result = validate(schema, { PORT: 'abc', NODE_ENV: 'local' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors).toHaveLength(3)
  })

  it('allows missing optional field without default', () => {
    const result = validate({ DEBUG: t.boolean({ required: false }) }, {})
    expect(result).toEqual({ ok: true, env: { DEBUG: undefined } })
  })
})
