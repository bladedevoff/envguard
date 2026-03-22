import { describe, it, expectTypeOf } from 'vitest'
import { envguard, t } from '../../src/index'

describe('type inference', () => {
  it('infers string type', () => {
    const env = envguard({ FOO: t.string() }, { onError: 'throw' })
    expectTypeOf(env.FOO).toBeString()
  })

  it('infers number type', () => {
    const env = envguard({ PORT: t.port() }, { onError: 'throw' })
    expectTypeOf(env.PORT).toBeNumber()
  })

  it('infers boolean type', () => {
    const env = envguard({ DEBUG: t.boolean() }, { onError: 'throw' })
    expectTypeOf(env.DEBUG).toBeBoolean()
  })

  it('infers enum literal union', () => {
    const env = envguard({ NODE_ENV: t.enum(['dev', 'staging', 'prod']) }, { onError: 'throw' })
    expectTypeOf(env.NODE_ENV).toEqualTypeOf<'dev' | 'staging' | 'prod'>()
  })
})
