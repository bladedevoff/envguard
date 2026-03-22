import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { resolveConfigPath } from '../../src/cli/resolve-config'

describe('resolveConfigPath', () => {
  let dir: string
  let origCwd: string

  beforeEach(() => {
    dir = join(tmpdir(), `envguard-resolve-${Date.now()}`)
    mkdirSync(dir, { recursive: true })
    origCwd = process.cwd()
    process.chdir(dir)
  })

  afterEach(() => {
    process.chdir(origCwd)
    rmSync(dir, { recursive: true, force: true })
  })

  it('returns explicit path when it exists', () => {
    const p = join(dir, 'custom.ts')
    writeFileSync(p, '')
    expect(resolveConfigPath(p)).toBe(p)
  })

  it('throws for explicit path that does not exist', () => {
    expect(() => resolveConfigPath('/nonexistent.ts')).toThrow('Config file not found')
  })

  it('finds envguard.config.ts first', () => {
    writeFileSync(join(dir, 'envguard.config.ts'), '')
    writeFileSync(join(dir, 'env.schema.ts'), '')
    expect(resolveConfigPath()).toContain('envguard.config.ts')
  })

  it('falls back to env.schema.ts', () => {
    writeFileSync(join(dir, 'env.schema.ts'), '')
    expect(resolveConfigPath()).toContain('env.schema.ts')
  })

  it('throws when no config found', () => {
    expect(() => resolveConfigPath()).toThrow('No envguard config found')
  })
})
