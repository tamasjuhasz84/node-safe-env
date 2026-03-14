# node-safe-env

Schema-based environment loading and validation for Node.js.

`node-safe-env` helps you fail fast at startup by validating environment variables
with a typed schema, parsing values into runtime types, and reporting all validation
issues in one error.

## Install

```bash
npm install node-safe-env
```

## Quick Start

```ts
import { createEnv, defineEnv } from "node-safe-env";

const schema = defineEnv({
  APP_NAME: { type: "string", required: true },
  PORT: { type: "port", default: 3000 },
  DEBUG: { type: "boolean", default: false },
  NODE_ENV: {
    type: "enum",
    values: ["development", "test", "production"],
    default: "development",
  },
} as const);

const env = createEnv(schema);

env.APP_NAME; // string
env.PORT; // number
env.DEBUG; // boolean
env.NODE_ENV; // "development" | "test" | "production"
```

## `defineEnv()`

`defineEnv()` locks schema literal types with a single top-level `as const`. Use it when you want to export or reuse a schema across modules.

```ts
// env.schema.ts
import { defineEnv } from "node-safe-env";

export const schema = defineEnv({
  PORT: { type: "port", default: 3000 },
  ADMIN_EMAIL: { type: "email", required: true },
} as const);
```

```ts
// main.ts
import { createEnv } from "node-safe-env";
import { schema } from "./env.schema.js";

const env = createEnv(schema);
```

## Nested Schemas

Schemas can be nested. Input env keys are flattened using uppercase segments joined by `_`.

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

```env
SERVER_PORT=4000
DATABASE_URL=postgres://localhost:5432/app
```

```ts
env.server.port; // number
env.database.url; // string
```

## Loading Order

When `options.source` is not provided, values are loaded and merged in this order (last one wins):

1. `.env`
2. `.env.local`
3. `.env.<NODE_ENV>`
4. custom file from `options.envFile`
5. `process.env`

## Supported Rule Types

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

## Email Rule

```ts
const env = createEnv({
  ADMIN_EMAIL: { type: "email", required: true },
});
```

## Date Rule

`date` parses ISO-compatible values into `Date`.

```ts
const env = createEnv({
  START_DATE: { type: "date", required: true },
});

env.START_DATE; // Date
```

## Custom Rule

Supply a `parse` function that returns the typed value or throws for invalid input.

```ts
const env = createEnv({
  RETRY_DELAY_MS: {
    type: "custom",
    parse: (raw) => {
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 0)
        throw new Error("Must be a non-negative integer.");
      return n;
    },
  },
});

env.RETRY_DELAY_MS; // number
```

If `parse` throws, `createEnv` records an `invalid_custom` validation issue with the thrown message.

## Array Rule Options

Array parsing supports separator and item controls.

```ts
const env = createEnv({
  ALLOWED_HOSTS: {
    type: "array",
    separator: "|", // default: ","
    trimItems: false, // default: true
    allowEmptyItems: true, // default: false
  },
});
```

Defaults:

- `separator`: `","`
- `trimItems`: `true`
- `allowEmptyItems`: `false`

## Defaults (Static and Functional)

Defaults go through the same parse/validation pipeline as environment input.

```ts
const env = createEnv({
  PORT: { type: "port", default: 3000 },
  START_DATE: { type: "date", default: () => "2026-01-01" },
  ADMIN_EMAIL: { type: "email", default: () => "admin@example.com" },
});
```

If a functional default throws, `createEnv` returns a structured `invalid_default` validation issue.

## Debug Mode

Enable debug reporting during `createEnv` execution.

```ts
import { createEnv, type EnvDebugReport } from "node-safe-env";

const reports: EnvDebugReport[] = [];

createEnv(schema, {
  debug: {
    logger: (report) => reports.push(report),
  },
});
```

Also supported:

```ts
createEnv(schema, { debug: true }); // emits one report via console.info
```

Debug reports include:

- loaded file metadata (`loadedFiles`)
- per-key entries (`keys`) with source, status, default usage, and issue details

Sensitive rules (`sensitive: true`) are masked as `"***"` in debug `raw` and `parsed` fields.

## Strict Mode

```ts
createEnv(schema, { strict: true });
```

Strict mode reports unknown environment keys as validation issues.

## Masking Sensitive Values

Use `maskEnv()` to sanitize parsed env output for logs.

```ts
import { createEnv, maskEnv } from "node-safe-env";

const schema = {
  API_TOKEN: { type: "string", required: true, sensitive: true },
  PORT: { type: "port", default: 3000 },
} as const;

const env = createEnv(schema);
const safeEnv = maskEnv(schema, env);
```

## Source Tracing

Use `traceEnv()` when you have a source map of raw values and origin labels.

```ts
import { traceEnv } from "node-safe-env";

const trace = traceEnv(
  {
    PORT: { type: "port" },
  },
  {
    PORT: { source: "process.env", raw: "3000" },
  },
  {
    PORT: 3000,
  },
);
```

## `.env.example` Validation

Validate an example file against your schema:

```ts
import { validateExampleEnvFile } from "node-safe-env";

const issues = validateExampleEnvFile(schema, {
  cwd: process.cwd(),
  exampleFile: ".env.example",
});
```

Or validate an in-memory object:

```ts
import { validateExampleEnv } from "node-safe-env";

const issues = validateExampleEnv(schema, {
  PORT: "",
});
```

## CLI

`node-safe-env` includes a CLI with two commands.

```bash
# installed locally (package.json scripts or npx)
node-safe-env validate --schema ./dist/env.schema.js
node-safe-env validate-example --schema ./dist/env.schema.js

# one-off with npx
npx node-safe-env validate --schema ./dist/env.schema.js
```

`validate` options:

- `--schema <path>` (required)
- `--cwd <path>`
- `--env-file <path>`
- `--node-env <value>`
- `--strict`

`validate-example` options:

- `--schema <path>` (required)
- `--cwd <path>`
- `--example-file <path>`

CLI schema loading note:

- the `--schema` target must be an executable JavaScript module
- accepted export shapes: default export or named export `schema`
- use built `.js`, `.mjs`, or `.cjs` files for CLI usage

## Error Handling

Validation issues are aggregated and thrown as `EnvValidationError`.

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

## API Summary

Exports:

- `createEnv`
- `defineEnv`
- `EnvValidationError`
- `maskEnv`
- `mergeSources`
- `traceEnv`
- `validateExampleEnv`
- `validateExampleEnvFile`
- `readEnvFileSource`
- `resolveExampleEnvPath`

`createEnv(schema, options?)` options:

```ts
{
  source?: Record<string, string | undefined>;
  cwd?: string;
  nodeEnv?: string;
  envFile?: string;
  strict?: boolean;
  debug?: boolean | { logger?: (report: EnvDebugReport) => void };
}
```

## Compatibility

- Node.js >= 18
- ESM and CommonJS builds
- TypeScript declarations included

## Development Scripts

```bash
npm run lint
npm run build
npm run typecheck
npm run test
npm run test:watch
npm run check
```

## License

MIT
