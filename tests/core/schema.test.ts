import { describe, it, expect } from 'vitest'
import { t } from '../../src/core/schema'

describe('t.string', () => {
  it('validates non-empty string', () => {
    const field = t.string()
    expect(field._validate('hello')).toEqual({ success: true, value: 'hello' })
  })

  it('rejects empty string when required', () => {
    const field = t.string()
    expect(field._validate('')).toEqual({ success: false, message: 'must be a non-empty string' })
  })
})

describe('t.number', () => {
  it('parses integer', () => {
    expect(t.number()._validate('42')).toEqual({ success: true, value: 42 })
  })

  it('parses float', () => {
    expect(t.number()._validate('3.14')).toEqual({ success: true, value: 3.14 })
  })

  it('rejects non-numeric', () => {
    expect(t.number()._validate('abc').success).toBe(false)
  })
})

describe('t.boolean', () => {
  it.each([
    ['true', true], ['false', false],
    ['1', true], ['0', false],
    ['yes', true], ['no', false],
    ['TRUE', true], ['FALSE', false],
  ])('parses %s as %s', (input, expected) => {
    expect(t.boolean()._validate(input)).toEqual({ success: true, value: expected })
  })

  it('rejects invalid boolean', () => {
    expect(t.boolean()._validate('maybe').success).toBe(false)
  })
})

describe('t.port', () => {
  it('accepts valid port', () => {
    expect(t.port()._validate('3000')).toEqual({ success: true, value: 3000 })
  })

  it('rejects port 0', () => {
    expect(t.port()._validate('0').success).toBe(false)
  })

  it('rejects port > 65535', () => {
    expect(t.port()._validate('70000').success).toBe(false)
  })

  it('rejects non-integer', () => {
    expect(t.port()._validate('3.14').success).toBe(false)
  })
})

describe('t.url', () => {
  it('accepts valid URL', () => {
    expect(t.url()._validate('https://example.com')).toEqual({ success: true, value: 'https://example.com' })
  })

  it('rejects invalid URL', () => {
    expect(t.url()._validate('not-a-url').success).toBe(false)
  })
})

describe('t.email', () => {
  it('accepts valid email', () => {
    expect(t.email()._validate('user@example.com').success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(t.email()._validate('not-email').success).toBe(false)
  })
})

describe('t.enum', () => {
  it('accepts valid enum value', () => {
    expect(t.enum(['dev', 'staging', 'prod'])._validate('dev')).toEqual({ success: true, value: 'dev' })
  })

  it('rejects invalid enum value', () => {
    const result = t.enum(['dev', 'staging', 'prod'])._validate('local')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.message).toContain('dev')
      expect(result.message).toContain('prod')
    }
  })
})

describe('t.json', () => {
  it('parses valid JSON', () => {
    expect(t.json()._validate('{"a":1}')).toEqual({ success: true, value: { a: 1 } })
  })

  it('rejects invalid JSON', () => {
    expect(t.json()._validate('{bad').success).toBe(false)
  })
})

describe('field options', () => {
  it('default implies not required', () => {
    const field = t.string({ default: 'fallback' })
    expect(field._required).toBe(false)
    expect(field._default).toBe('fallback')
  })

  it('secret flag is stored', () => {
    expect(t.string({ secret: true })._secret).toBe(true)
  })

  it('required defaults to true', () => {
    expect(t.string()._required).toBe(true)
  })
})
