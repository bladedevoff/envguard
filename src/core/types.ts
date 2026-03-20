export interface FieldOptions<T = unknown> {
  required?: boolean
  default?: T
  secret?: boolean
}

export interface SchemaField<T = unknown> {
  _type: T
  _required: boolean
  _default: T | undefined
  _secret: boolean
  _parse: (raw: string) => T
  _validate: (raw: string) => { success: true; value: T } | { success: false; message: string }
}

export type Schema = Record<string, SchemaField>

export type InferEnv<S extends Schema> = {
  [K in keyof S]: S[K]['_type']
}

export interface ValidationError {
  key: string
  message: string
  received?: string
}
