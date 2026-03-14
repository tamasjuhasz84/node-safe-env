# node-safe-env

Schema-based environment loading and validation for Node.js.

Parse, validate, and type your environment variables with a simple schema.

`node-safe-env` helps you **fail fast at startup** by validating environment variables
with a typed schema. It loads values from `.env` files, merges with `process.env`,
parses common primitive types, and throws a single readable error with all validation issues.

---

## Why use it?

- Validate configuration at boot instead of runtime
- Zero runtime dependencies
- Strong TypeScript inference
- Typed environment values
- Nested configuration support
- Aggregated validation errors
- Optional strict mode
- `.env.example` validation
- Built-in masking for secrets
- Source tracing for debugging
- ESM + CommonJS builds

---

## Install

```bash
npm install node-safe-env
```

---

## Quick Start

```ts
import { createEnv } from "node-safe-env";

const env = createEnv({
  PORT: { type: "port", default: 3000 },
  DEBUG: { type: "boolean", default: false },
  NODE_ENV: {
    type: "enum",
    values: ["development", "test", "production"] as const,
    default: "development",
  },
  JWT_SECRET: { type: "string", required: true },
});

env.PORT; // number
env.DEBUG; // boolean
env.NODE_ENV; // "development" | "test" | "production"
```

---

## Nested Configuration

Schemas may be nested. Environment keys are automatically flattened.

```ts
const env = createEnv({
  server: {
    port: { type: "port", default: 3000 },
  },
  database: {
    url: { type: "string", required: true },
  },
});
```

Environment variables:

```env
SERVER_PORT=3000
DATABASE_URL=postgres://localhost/app
```

Usage:

```ts
env.server.port;
env.database.url;
```

---

## How loading works

When `options.source` is not provided, values are loaded and merged in this order
(last one wins):

1. `.env`
2. `.env.local`
3. `.env.<NODE_ENV>`
4. custom file via `options.envFile`
5. `process.env`

---

## Supported Types

`node-safe-env` supports the following schema types:

- `string`
- `number`
- `boolean`
- `enum`
- `url`
- `port`
- `json`
- `int`
- `float`
- `array`
- `email`
- `date`
- `custom`

Example:

```ts
const env = createEnv({
  API_URL: { type: "url", required: true },
  PORT: { type: "port", default: 3000 },
  FEATURE_FLAGS: { type: "json" },
  RETRY_COUNT: { type: "int", default: 3 },
  TIMEOUT: { type: "float" },
  TAGS: { type: "array" },
  ADMIN_EMAIL: { type: "email", required: true },
  START_DATE: { type: "date" },
});
```

---

## Email Type

Use `type: "email"` for email address validation.

```ts
const env = createEnv({
  ADMIN_EMAIL: { type: "email", required: true },
});
```

```env
ADMIN_EMAIL=admin@example.com
```

Parsed result:

```ts
env.ADMIN_EMAIL; // string
```

---

## Date Type

Use `type: "date"` for ISO date parsing.

Supported formats:

- `YYYY-MM-DD`
- ISO datetime strings such as `2025-01-01T10:30:00Z`

```ts
const env = createEnv({
  START_DATE: { type: "date", required: true },
});
```

```env
START_DATE=2025-01-01
```

Parsed result:

```ts
env.START_DATE; // Date
```

Example:

```ts
env.START_DATE.toISOString();
```

Note: `date` is intentionally strict and expects ISO-compatible input.
Locale-specific date formats such as `01/31/2025` are not supported.

---

## Default Values

Defaults are validated and parsed through the same pipeline as loaded environment values before being added to the final output.

```ts
const env = createEnv({
  PORT: { type: "port", default: 3000 },
  DEBUG: { type: "boolean", default: false },
  ADMIN_EMAIL: { type: "email", default: "admin@example.com" },
  START_DATE: { type: "date", default: "2025-01-01" },
});
```

This means the final config object always contains parsed values, including defaults.

---

## Custom Parsing

```ts
const env = createEnv({
  START_DATE: {
    type: "custom",
    parse: (value) => new Date(value),
  },
});
```

---

## Transform Values

```ts
const env = createEnv({
  APP_NAME: {
    type: "string",
    transform: (value) => value.trim(),
  },
});
```

---

## Strict Mode

Detect unknown environment variables.

```ts
const env = createEnv(schema, {
  strict: true,
});
```

Unknown keys will produce validation issues.

---

## Masking Sensitive Values

```ts
const schema = {
  API_KEY: {
    type: "string",
    sensitive: true,
  },
};
```

Mask them for logs:

```ts
import { maskEnv } from "node-safe-env";

maskEnv(schema, env);
```

Output:

```ts
{
  API_KEY: "***";
}
```

---

## Source Tracing

Inspect where values came from.

```ts
import { traceEnv } from "node-safe-env";

const trace = traceEnv(schema, sources, env);
```

Example output:

```ts
{
  PORT: {
    source: "process.env",
    raw: "3000",
    parsed: 3000
  }
}
```

---

## `.env.example` Validation

Validate your example file against the schema.

```ts
import { validateExampleEnvFile } from "node-safe-env";

const issues = validateExampleEnvFile(schema);
```

This detects:

- missing example variables
- unknown example keys

---

## Error Handling

Validation problems are aggregated and thrown as `EnvValidationError`.

```ts
import { createEnv, EnvValidationError } from "node-safe-env";

try {
  createEnv(schema);
} catch (error) {
  if (error instanceof EnvValidationError) {
    console.error(error.issues);
  }
}
```

---

## API

### `createEnv(schema, options?)`

Options:

```ts
{
  source?: EnvSource
  cwd?: string
  nodeEnv?: string
  envFile?: string
  strict?: boolean
}
```

---

## Development

```bash
npm install
npm run lint
npm run build
npm run test
```

Helpful scripts:

```bash
npm run test:watch
npm run check
```

---

## CLI

`node-safe-env` includes a small CLI for validation workflows.

### Validate environment files

```bash
node-safe-env validate --schema ./dist/env.schema.js
```

### Validate `.env.example`

```bash
node-safe-env validate-example --schema ./dist/env.schema.js
```

### Options

#### `validate`

- `--schema <path>`
- `--cwd <path>`
- `--env-file <path>`
- `--node-env <value>`
- `--strict`

#### `validate-example`

- `--schema <path>`
- `--cwd <path>`
- `--example-file <path>`

Note: the CLI currently expects a runnable JavaScript schema module.
For example, use a built `.js`, `.mjs`, or `.cjs` file rather than a raw `.ts` file.

## Compatibility

- Node.js >=18
- ESM and CommonJS
- TypeScript declarations included

---

## Roadmap

Planned extensions:

- CLI for `.env` validation
- example file generation
- advanced array parsing options
- functional defaults
- debug mode
- plugin system for validators

---

## License

MIT
