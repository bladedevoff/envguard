# envguard

Type-safe `.env` for Node.js. Define a schema, get validation + TypeScript types + CLI.

Stop discovering missing env vars at runtime.

## Install

```bash
npm install envguard
```

## Usage

```ts
// env.schema.ts
import { envguard, t } from 'envguard'

export default envguard({
  DATABASE_URL: t.url({ required: true }),
  PORT: t.port({ default: 3000 }),
  NODE_ENV: t.enum(['development', 'staging', 'production']),
  DEBUG: t.boolean({ default: false }),
  API_KEY: t.string({ secret: true }),
})
```

```ts
// app.ts
import env from './env.schema'

console.log(env.PORT)      // number
console.log(env.NODE_ENV)  // 'development' | 'staging' | 'production'
```

Full autocomplete. Zero runtime surprises.

## CLI

```bash
# Validate .env against schema
npx envguard check

# Generate schema from existing .env
npx envguard init
```

```
✗ envguard: 2 problems found

  DATABASE_URL  ✗ required but missing
  PORT          ✗ "abc" is not a valid port (expected 1-65535)

  1 variable OK, 2 failed
```

## Types

| Helper | Output | Validates |
|---|---|---|
| `t.string()` | `string` | Non-empty |
| `t.number()` | `number` | Numeric |
| `t.boolean()` | `boolean` | true/false, 1/0, yes/no |
| `t.port()` | `number` | 1–65535 |
| `t.url()` | `string` | Valid URL |
| `t.email()` | `string` | Valid email |
| `t.enum([...])` | Literal union | One of values |
| `t.json<T>()` | `T` | Valid JSON |

Every helper accepts `{ required, default, secret }`.

## Options

```ts
envguard(schema, {
  path: '.env',       // default: reads process.env
  onError: 'throw',   // 'throw' | 'exit' | 'warn' (default: 'exit')
})
```

## vs. alternatives

| | dotenv | envalid | t3-env | **envguard** |
|---|---|---|---|---|
| .env parsing | ✓ | ✗ | ✗ | ✓ |
| Validation | ✗ | ✓ | ✓ | ✓ |
| TS inference | ✗ | Partial | ✓ | ✓ |
| CLI tools | ✗ | ✗ | ✗ | ✓ |

## License

MIT
