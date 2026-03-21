import type { Schema, ValidationError } from './types'

type ValidateResult<S extends Schema> =
  | { ok: true; env: { [K in keyof S]: S[K]['_type'] } }
  | { ok: false; errors: ValidationError[] }

export function validate<S extends Schema>(schema: S, parsed: Record<string, string>): ValidateResult<S> {
  const errors: ValidationError[] = []
  const env: Record<string, unknown> = {}

  for (const [key, field] of Object.entries(schema)) {
    const raw = parsed[key]

    if (raw === undefined) {
      if (field._default !== undefined) {
        env[key] = field._default
        continue
      }
      if (field._required) {
        errors.push({ key, message: 'required but missing' })
        continue
      }
      env[key] = undefined
      continue
    }

    const result = field._validate(raw)
    if (result.success) {
      env[key] = result.value
    } else {
      errors.push({ key, message: result.message, received: raw })
    }
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, env: env as { [K in keyof S]: S[K]['_type'] } }
}
