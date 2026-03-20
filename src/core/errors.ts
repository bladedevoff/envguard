import type { ValidationError } from './types'

export class EnvValidationError extends Error {
  errors: ValidationError[]

  constructor(errors: ValidationError[]) {
    super(`envguard: ${errors.length} problem${errors.length > 1 ? 's' : ''} found`)
    this.name = 'EnvValidationError'
    this.errors = errors
  }
}
