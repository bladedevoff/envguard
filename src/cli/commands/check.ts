import { defineCommand } from 'citty'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createJiti } from 'jiti'
import { parse } from '../../core/parser'
import { validate } from '../../core/validator'
import { resolveConfigPath } from '../resolve-config'
import { formatCheckResult } from '../reporter'
import type { Schema } from '../../core/types'

const jiti = createJiti(import.meta.url)

export const checkCommand = defineCommand({
  meta: { name: 'check', description: 'Validate .env against schema' },
  args: {
    config: { type: 'string', description: 'Path to config file' },
    env: { type: 'string', description: 'Path to .env file', default: '.env' },
  },
  async run({ args }) {
    const configPath = resolveConfigPath(args.config)
    const mod = await jiti.import(configPath) as Record<string, unknown>
    const schema = (mod.default || mod) as Schema

    const envPath = resolve(args.env)
    const content = readFileSync(envPath, 'utf-8')
    const parsed = parse(content)

    const result = validate(schema, parsed)
    const total = Object.keys(schema).length

    if (result.ok) {
      process.stdout.write(formatCheckResult([], total))
      process.exit(0)
    } else {
      process.stdout.write(formatCheckResult(result.errors, total))
      process.exit(1)
    }
  },
})
