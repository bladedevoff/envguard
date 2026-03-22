import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const CONFIG_NAMES = ['envguard.config.ts', 'env.schema.ts']

export function resolveConfigPath(explicit?: string): string {
  if (explicit) {
    const p = resolve(explicit)
    if (!existsSync(p)) throw new Error(`Config file not found: ${p}`)
    return p
  }

  for (const name of CONFIG_NAMES) {
    const p = resolve(process.cwd(), name)
    if (existsSync(p)) return p
  }

  throw new Error(
    `No envguard config found. Expected one of:\n${CONFIG_NAMES.map(n => `  - ${n}`).join('\n')}`,
  )
}
