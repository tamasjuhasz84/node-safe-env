# node-safe-env

Schema-based environment loading and validation for Node.js.
Parse, validate, and type your environment variables with a simple schema.

`node-safe-env` helps you fail fast at startup by validating environment
variables with a typed schema. It loads values from `.env` files, merges with
`process.env`, parses primitive types, and throws a single readable error with
all validation issues.

## Why use it?

- Validate config at boot, not at runtime
- Keep runtime dependencies at zero
- Parse and type env values (`string`, `number`, `boolean`, `enum`, `url`, `port`, `json`)
- Aggregate all validation issues in one error
- Ship both ESM and CommonJS builds

## Install

```bash
npm install node-safe-env
```

## Status

- Current version: `0.1.0`
- Stability: MVP, suitable for early production adoption with pinned versions

## Quick Start

```ts
import { createEnv } from "node-safe-env";

const env = createEnv({
  PORT: { type: "number", default: 3000 },
  DEBUG: { type: "boolean", default: false },
  NODE_ENV: {
    type: "enum",
    values: ["development", "test", "production"] as const,
    default: "development",
  },
  JWT_SECRET: { type: "string", required: true },
});

// env.PORT is a number
// env.DEBUG is a boolean
// env.NODE_ENV is "development" | "test" | "production"
```

## How loading works

When `options.source` is not provided, values are loaded and merged in this
order (last one wins):

1. `.env`
2. `.env.local`
3. `.env.<NODE_ENV>`
4. custom file from `options.envFile` (optional)
5. `process.env`

## API

## Supported types

`node-safe-env` currently supports the following schema types:

- `string`
- `number`
- `boolean`
- `enum`
- `url`
- `port`
- `json`

  Example:

  ```ts
  const env = createEnv({
    API_URL: { type: "url", required: true },
    PORT: { type: "port", default: 3000 },
    FEATURE_FLAGS: { type: "json" },
  });
  ```

### `createEnv(schema, options?)`

Build and validate a typed env object.

```ts
const env = createEnv(schema, {
  source, // optional manual source map
  cwd, // optional base directory for env files
  nodeEnv, // optional NODE_ENV override
  envFile, // optional extra env file path
});
```

### Schema rule fields

- `type`: `"string" | "number" | "boolean" | "enum" | "url" | "port" | "json"`
- `required?`: throw `missing` issue when value is not provided
- `default?`: fallback value when missing (or empty if `allowEmpty !== true`)
- `allowEmpty?`: allow empty or whitespace-only strings
- `values`: required for `enum`

### Rule examples

```ts
const schema = {
  APP_NAME: { type: "string", default: "my-app" },
  PORT: { type: "number", default: 3000 },
  DEBUG: { type: "boolean", default: false },
  LOG_LEVEL: {
    type: "enum",
    values: ["debug", "info", "warn", "error"] as const,
    default: "info",
  },
};
```

## Error handling

Validation problems are aggregated and thrown as `EnvValidationError`.

```ts
import { createEnv, EnvValidationError } from "node-safe-env";

try {
  createEnv({
    PORT: { type: "number", required: true },
    DEBUG: { type: "boolean", required: true },
  });
} catch (error) {
  if (error instanceof EnvValidationError) {
    console.error(error.message);
    console.error(error.issues);
  }
}
```

Example message:

```text
Environment validation failed:
- [invalid_number] Environment variable "PORT" must be a valid number.
- [invalid_boolean] Environment variable "DEBUG" must be a valid boolean.
```

## Development

```bash
npm install
npm run lint
npm run build
npm run test
```

Helpful scripts:

- `npm run test:watch` for local TDD loop
- `npm run check` to run format, lint, build, and tests

## Compatibility

- Node.js `>=18`
- ESM and CommonJS consumers
- TypeScript declaration files included

## Roadmap

Planned extensions:

- `array` type support
- Strict mode for unknown keys and source auditing
- Custom validators and custom issue messages
- Optional async source loaders

## Open source notes

If you adopt this package for production, recommended repository additions are:

- GitHub Actions CI workflow for lint/build/test
- PR and issue templates
- CODEOWNERS and SECURITY.md
- release automation (Changesets or semantic-release)
- coverage reporting and badge updates

## .env parsing notes

The built-in parser supports a lightweight dotenv-style format.

Supported behavior:

- empty and malformed lines are ignored
- lines starting with `#` are treated as comments
- `export KEY=value` syntax is supported
- inline comments are supported outside quoted values
- quoted values may contain spaces and `=`

This package does not aim to be a full dotenv parser replacement with every edge case.
It intentionally supports a small, documented subset.
