import { defineCommand } from 'citty'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from '../../core/parser'

const SECRET_PATTERNS = ['key', 'secret', 'token', 'password', 'pass', 'credential', 'auth']

// best-effort type inference — priority: port (by name) > url > boolean > number > string
function inferType(key: string, value: string): string {
  const lower = key.toLowerCase()
  const isSecret = SECRET_PATTERNS.some(p => lower.includes(p))

  if (lower.includes('port')) return 't.port()'

  try { new URL(value); return 't.url()' } catch {}

  if (['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase())) return 't.boolean()'

  if (value !== '' && !isNaN(Number(value))) return 't.number()'

  return isSecret ? 't.string({ secret: true })' : 't.string()'
}

export function generateSchema(vars: Record<string, string>): string {
  const fields = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${inferType(k, v)},`)
    .join('\n')

  return `import { envguard, t } from 'envguard'\n\nexport default envguard({\n${fields}\n})\n`
}

export const initCommand = defineCommand({
  meta: { name: 'init', description: 'Generate env.schema.ts from existing .env' },
  args: {
    env: { type: 'string', description: 'Path to .env file', default: '.env' },
    output: { type: 'string', description: 'Output file', default: 'env.schema.ts' },
  },
  async run({ args }) {
    const envPath = resolve(args.env)
    if (!existsSync(envPath)) {
      console.error(`File not found: ${envPath}`)
      process.exit(1)
    }

    const outputPath = resolve(args.output)
    if (existsSync(outputPath)) {
      console.error(`File already exists: ${outputPath}`)
      process.exit(1)
    }

    const parsed = parse(readFileSync(envPath, 'utf-8'))
    writeFileSync(outputPath, generateSchema(parsed))
    console.log(`✓ Scanned ${args.env} (${Object.keys(parsed).length} variables)`)
    console.log(`✓ Generated ${args.output}`)
  },
})
