import { z } from 'zod'
import type { FieldOptions, SchemaField } from './types'

function createField<T>(
  opts: FieldOptions<T>,
  parse: (raw: string) => T,
  validate: (raw: string) => { success: true; value: T } | { success: false; message: string },
): SchemaField<T> {
  return {
    _type: undefined as T,
    _required: opts.default !== undefined ? false : (opts.required ?? true),
    _default: opts.default,
    _secret: opts.secret ?? false,
    _parse: parse,
    _validate: validate,
  }
}

const emailSchema = z.string().email()

export const t = {
  string(opts: FieldOptions<string> = {}) {
    return createField<string>(
      opts,
      raw => raw,
      raw => raw.length > 0
        ? { success: true, value: raw }
        : { success: false, message: 'must be a non-empty string' },
    )
  },

  number(opts: FieldOptions<number> = {}) {
    return createField<number>(
      opts,
      raw => Number(raw),
      raw => {
        const n = Number(raw)
        return !isNaN(n) && raw.trim() !== ''
          ? { success: true, value: n }
          : { success: false, message: 'must be a valid number' }
      },
    )
  },

  boolean(opts: FieldOptions<boolean> = {}) {
    const truthy = new Set(['true', '1', 'yes'])
    const falsy = new Set(['false', '0', 'no'])
    return createField<boolean>(
      opts,
      raw => truthy.has(raw.toLowerCase()),
      raw => {
        const v = raw.toLowerCase()
        if (truthy.has(v)) return { success: true, value: true }
        if (falsy.has(v)) return { success: true, value: false }
        return { success: false, message: 'must be one of: true, false, 1, 0, yes, no' }
      },
    )
  },

  port(opts: FieldOptions<number> = {}) {
    return createField<number>(
      opts,
      raw => parseInt(raw, 10),
      raw => {
        const n = Number(raw)
        if (!Number.isInteger(n) || n < 1 || n > 65535) {
          return { success: false, message: 'must be an integer between 1 and 65535' }
        }
        return { success: true, value: n }
      },
    )
  },

  url(opts: FieldOptions<string> = {}) {
    return createField<string>(
      opts,
      raw => raw,
      raw => {
        try {
          new URL(raw)
          return { success: true, value: raw }
        } catch {
          return { success: false, message: 'must be a valid URL' }
        }
      },
    )
  },

  email(opts: FieldOptions<string> = {}) {
    return createField<string>(
      opts,
      raw => raw,
      raw => {
        const result = emailSchema.safeParse(raw)
        return result.success
          ? { success: true, value: raw }
          : { success: false, message: 'must be a valid email address' }
      },
    )
  },

  enum<const T extends string>(values: T[], opts: FieldOptions<T> = {}) {
    return createField<T>(
      opts,
      raw => raw as T,
      raw => (values as string[]).includes(raw)
        ? { success: true, value: raw as T }
        : { success: false, message: `must be one of: ${values.join(', ')}` },
    )
  },

  json<T = unknown>(opts: FieldOptions<T> = {}) {
    return createField<T>(
      opts,
      raw => JSON.parse(raw) as T,
      raw => {
        try {
          return { success: true, value: JSON.parse(raw) as T }
        } catch {
          return { success: false, message: 'must be valid JSON' }
        }
      },
    )
  },
}
