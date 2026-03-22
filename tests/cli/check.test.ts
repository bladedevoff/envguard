import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'

describe('envguard check', () => {
  let dir: string

  beforeEach(() => {
    dir = join(tmpdir(), `envguard-cli-${Date.now()}`)
    mkdirSync(dir, { recursive: true })
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  function run(cwd: string): { stdout: string; exitCode: number } {
    try {
      const stdout = execFileSync(
        'npx', ['tsx', join(process.cwd(), 'src/cli/index.ts'), 'check'],
        { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
      )
      return { stdout, exitCode: 0 }
    } catch (err: any) {
      return { stdout: err.stdout || err.stderr || '', exitCode: err.status }
    }
  }

  it('exits 0 when all variables are valid', () => {
    writeFileSync(join(dir, '.env'), 'PORT=3000')
    writeFileSync(
      join(dir, 'envguard.config.ts'),
      `import { t } from '${process.cwd()}/src/core/schema'\nexport default { PORT: t.port() }`,
    )
    const { exitCode, stdout } = run(dir)
    expect(exitCode).toBe(0)
    expect(stdout).toContain('OK')
  })

  it('exits 1 when variables are invalid', () => {
    writeFileSync(join(dir, '.env'), 'PORT=abc')
    writeFileSync(
      join(dir, 'envguard.config.ts'),
      `import { t } from '${process.cwd()}/src/core/schema'\nexport default { PORT: t.port() }`,
    )
    const { exitCode, stdout } = run(dir)
    expect(exitCode).toBe(1)
    expect(stdout).toContain('problem')
  })
})
