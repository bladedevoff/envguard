import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { envguard, t, EnvValidationError } from '../src/index'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

describe('envguard()', () => {
  let dir: string

  beforeEach(() => {
    dir = join(tmpdir(), `envguard-test-${Date.now()}`)
    mkdirSync(dir, { recursive: true })
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('parses and validates .env file', () => {
    const p = join(dir, '.env')
    writeFileSync(p, 'PORT=3000\nHOST=localhost\nDEBUG=true')

    const env = envguard(
      { PORT: t.port(), HOST: t.string(), DEBUG: t.boolean() },
      { path: p, onError: 'throw' },
    )

    expect(env.PORT).toBe(3000)
    expect(env.HOST).toBe('localhost')
    expect(env.DEBUG).toBe(true)
  })

  it('throws EnvValidationError on invalid values', () => {
    const p = join(dir, '.env')
    writeFileSync(p, 'PORT=abc')

    expect(() =>
      envguard({ PORT: t.port() }, { path: p, onError: 'throw' }),
    ).toThrow(EnvValidationError)
  })

  it('uses defaults for missing variables', () => {
    const p = join(dir, '.env')
    writeFileSync(p, '')

    const env = envguard(
      { PORT: t.port({ default: 8080 }) },
      { path: p, onError: 'throw' },
    )
    expect(env.PORT).toBe(8080)
  })

  it('reads from process.env when no path given', () => {
    process.env.__ENVGUARD_TEST__ = '42'
    const env = envguard({ __ENVGUARD_TEST__: t.number() }, { onError: 'throw' })
    expect(env.__ENVGUARD_TEST__).toBe(42)
    delete process.env.__ENVGUARD_TEST__
  })
})
