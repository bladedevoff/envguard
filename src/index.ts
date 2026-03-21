import { readFileSync } from 'node:fs'
import { parse } from './core/parser'
import { validate } from './core/validator'
import { EnvValidationError } from './core/errors'
import type { Schema, ValidationError } from './core/types'

export { t } from './core/schema'
export { EnvValidationError }
export type { ValidationError }

interface EnvguardOptions {
  path?: string
  onError?: 'throw' | 'warn' | 'exit'
}

function formatErrors(errors: ValidationError[]): string {
  const lines = errors.map(e => `  ${e.key}: ${e.message}${e.received !== undefined ? ` (got: ${e.received})` : ''}`)
  return `envguard validation failed:\n${lines.join('\n')}`
}

export function envguard<S extends Schema>(
  schema: S,
  opts: EnvguardOptions = {},
): { [K in keyof S]: S[K]['_type'] } {
  const { path, onError = 'exit' } = opts

  const raw = path
    ? parse(readFileSync(path, 'utf8'))
    : (process.env as Record<string, string>)

  const result = validate(schema, raw)

  if (!result.ok) {
    const msg = formatErrors(result.errors)
    if (onError === 'throw') throw new EnvValidationError(result.errors)
    if (onError === 'warn') {
      console.warn(msg)
      return {} as { [K in keyof S]: S[K]['_type'] }
    }
    console.error(msg)
    process.exit(1)
  }

  return result.env
}
