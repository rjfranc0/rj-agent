# Configuration

## Validate Environment with envalid

Use `envalid` to validate environment variables at startup. It exits the process immediately if any required variable is missing or malformed — don't start a server in a half-configured state.

```bash
npm install envalid fastify-envalid
```

Register `fastify-envalid` in `buildServer()` before any other plugin:

```ts
// src/server.ts
import fastifyEnvalid from 'fastify-envalid'

export async function buildServer() {
  const app = Fastify({ logger: true })

  await app.register(fastifyEnvalid)  // exposes app.cleanEnv, app.validators, app.makeValidator
  await app.register(import('./plugins/config.ts'))
  // ... rest of plugins
}
```

## Config Plugin

Define and expose the validated config as a `config` decorator so every plugin and handler accesses it through `app.config` instead of `process.env`:

```ts
// src/plugins/config.ts
import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'

// Define the shape of your validated env
export type Config = {
  NODE_ENV: 'development' | 'test' | 'production'
  PORT: number
  HOST: string
  DATABASE_URL: string
  JWT_SECRET: string
  LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
}

export default fp(async function configPlugin(app: FastifyInstance) {
  const { str, port, url, host } = app.validators

  const env = app.cleanEnv(process.env, {
    NODE_ENV: str({
      choices: ['development', 'test', 'production'],
      default: 'development',
    }),
    PORT: port({ default: 3000 }),
    HOST: host({ default: '0.0.0.0' }),
    DATABASE_URL: url(),
    JWT_SECRET: str({ desc: 'Secret key for JWT signing, min 32 chars' }),
    LOG_LEVEL: str({
      choices: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
      default: 'info',
    }),
  })

  app.decorate('config', env as Config)
}, { name: 'config' })

declare module 'fastify' {
  interface FastifyInstance {
    config: Config
  }
}
```

envalid's built-in validators: `str()`, `bool()`, `num()`, `port()`, `url()`, `host()`, `email()`, `json()`. Use them over manual string parsing — they give you typed output and clear error messages at startup.

## Access Config via Decorator

Never read `process.env` outside the config plugin. Use `app.config` everywhere else:

```ts
// ✗ scattered and untyped
const secret = process.env.JWT_SECRET

// ✓ typed and centralized
const secret = app.config.JWT_SECRET
```

## .env Files

Use `dotenv` in development. Load before any other imports:

```ts
// app.ts — first line
import 'dotenv/config'
import { buildServer } from './server.ts'
```

Never commit `.env`. Commit a `.env.example` with every key but no real values.

## Custom Validators

For values envalid doesn't cover natively, use `app.makeValidator()`:

```ts
const jwtSecret = app.makeValidator<string>((input) => {
  if (input.length < 32) throw new Error('JWT_SECRET must be at least 32 characters')
  return input
})

app.cleanEnv(process.env, {
  JWT_SECRET: jwtSecret(),
})
```

## Compatibility Note

`fastify-envalid` was last updated for Fastify v3. If it's incompatible with your Fastify version, use `envalid` directly in the config plugin — the pattern is identical, just import `cleanEnv` and validators from `envalid` instead of `app`:

```ts
import { cleanEnv, str, port, url } from 'envalid'

export default fp(async function configPlugin(app) {
  const env = cleanEnv(process.env, {
    PORT: port({ default: 3000 }),
    DATABASE_URL: url(),
    JWT_SECRET: str(),
  })
  app.decorate('config', env)
})
```
