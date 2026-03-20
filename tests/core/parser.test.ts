import { describe, it, expect } from 'vitest'
import { parse } from '../../src/core/parser'

describe('parse', () => {
  it('parses simple KEY=value pairs', () => {
    expect(parse('FOO=bar\nBAZ=qux')).toEqual({ FOO: 'bar', BAZ: 'qux' })
  })

  it('trims unquoted values', () => {
    expect(parse('FOO=  bar  ')).toEqual({ FOO: 'bar' })
  })

  it('handles single-quoted values as literals', () => {
    expect(parse("FOO='bar baz'")).toEqual({ FOO: 'bar baz' })
  })

  it('handles double-quoted values with escape sequences', () => {
    expect(parse('FOO="line1\\nline2"')).toEqual({ FOO: 'line1\nline2' })
    expect(parse('FOO="tab\\there"')).toEqual({ FOO: 'tab\there' })
  })

  it('ignores comment lines', () => {
    expect(parse('# comment\nFOO=bar')).toEqual({ FOO: 'bar' })
  })

  it('ignores inline comments after unquoted values', () => {
    expect(parse('FOO=bar # comment')).toEqual({ FOO: 'bar' })
  })

  it('does not treat # in quoted values as comments', () => {
    expect(parse('FOO="bar # not a comment"')).toEqual({ FOO: 'bar # not a comment' })
  })

  it('handles empty values', () => {
    expect(parse('FOO=')).toEqual({ FOO: '' })
  })

  it('ignores empty lines', () => {
    expect(parse('\n\nFOO=bar\n\n')).toEqual({ FOO: 'bar' })
  })

  it('treats ${VAR} as literal (no interpolation)', () => {
    expect(parse('FOO=${BAR}')).toEqual({ FOO: '${BAR}' })
  })

  it('handles export prefix', () => {
    expect(parse('export FOO=bar')).toEqual({ FOO: 'bar' })
  })

  it('last value wins for duplicate keys', () => {
    expect(parse('FOO=first\nFOO=second')).toEqual({ FOO: 'second' })
  })

  it('handles values containing = signs', () => {
    expect(parse('KEY=base64==data')).toEqual({ KEY: 'base64==data' })
  })

  it('handles Windows line endings', () => {
    expect(parse('FOO=bar\r\nBAZ=qux')).toEqual({ FOO: 'bar', BAZ: 'qux' })
  })

  it('handles escaped backslash before n in double quotes', () => {
    expect(parse('FOO="path\\\\nto"')).toEqual({ FOO: 'path\\nto' })
  })
})
