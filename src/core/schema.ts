import type { FieldOptions, SchemaField } from './types'

// phantom _type field carries the inferred TS type without holding a runtime value
function createField<T>(
  opts: FieldOptions<T>,
  validate: (raw: string) => { success: true; value: T } | { success: false; message: string },
): SchemaField<T> {
  return {
    _type: undefined as T,
    _required: opts.default !== undefined ? false : (opts.required ?? true),
    _default: opts.default,
    _secret: opts.secret ?? false,
    _parse(raw) {
      const r = validate(raw)
      if (!r.success) throw new Error(r.message)
      return r.value
    },
    _validate: validate,
  }
}

import { z } from 'zod/v4'

// created lazily so zod schema isn't allocated until t.email() is first called
let _emailSchema: z.ZodString | null = null

export const t = {
  string(opts: FieldOptions<string> = {}) {
    return createField<string>(opts, raw =>
      raw.length > 0
        ? { success: true, value: raw }
        : { success: false, message: 'expected non-empty string' },
    )
  },

  number(opts: FieldOptions<number> = {}) {
    return createField<number>(opts, raw => {
      const n = Number(raw)
      return !isNaN(n) && raw.trim() !== ''
        ? { success: true, value: n }
        : { success: false, message: `"${raw}" is not a valid number` }
    })
  },

  boolean(opts: FieldOptions<boolean> = {}) {
    const truthy = new Set(['true', '1', 'yes'])
    const falsy = new Set(['false', '0', 'no'])
    return createField<boolean>(opts, raw => {
      const v = raw.toLowerCase()
      if (truthy.has(v)) return { success: true, value: true }
      if (falsy.has(v)) return { success: true, value: false }
      return { success: false, message: `expected true/false, 1/0, or yes/no — got "${raw}"` }
    })
  },

  port(opts: FieldOptions<number> = {}) {
    return createField<number>(opts, raw => {
      const n = Number(raw)
      if (!Number.isInteger(n) || n < 1 || n > 65535) {
        return { success: false, message: `"${raw}" is not a valid port (expected 1-65535)` }
      }
      return { success: true, value: n }
    })
  },

  url(opts: FieldOptions<string> = {}) {
    return createField<string>(opts, raw => {
      try {
        new URL(raw)
        return { success: true, value: raw }
      } catch {
        return { success: false, message: `invalid URL: "${raw}"` }
      }
    })
  },

  email(opts: FieldOptions<string> = {}) {
    return createField<string>(opts, raw => {
      _emailSchema ??= z.string().email()
      return _emailSchema.safeParse(raw).success
        ? { success: true, value: raw }
        : { success: false, message: `invalid email: "${raw}"` }
    })
  },

  enum<const T extends string>(values: T[], opts: FieldOptions<T> = {}) {
    return createField<T>(opts, raw =>
      (values as string[]).includes(raw)
        ? { success: true, value: raw as T }
        : { success: false, message: `"${raw}" is not one of: ${values.join(', ')}` },
    )
  },

  json<T = unknown>(opts: FieldOptions<T> = {}) {
    return createField<T>(opts, raw => {
      try {
        return { success: true, value: JSON.parse(raw) as T }
      } catch {
        return { success: false, message: `invalid JSON` }
      }
    })
  },
}
