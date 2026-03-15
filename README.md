# node-safe-env

Schema-based environment validation for Node.js and TypeScript.

`node-safe-env` helps you fail fast at startup: validate env variables, parse them into typed runtime values, and get all validation issues in one clear error report.

## Why node-safe-env?

- Fail-fast startup validation: catch config mistakes before your app starts serving traffic.
- Typed parsing: parse strings from `.env` and `process.env` into `number`, `boolean`, `Date`, arrays, and more.
- Aggregated errors: see all invalid/missing values at once.
- CLI validation: validate your env setup from scripts and CI.
- `.env.example` validation: keep examples aligned with your schema.
- Debug tracing: inspect where each value came from and how it was parsed.

## Try It Now

```bash
npx node-safe-env --help
npx node-safe-env validate --schema ./env.schema.ts
npx node-safe-env validate-example --schema ./env.schema.ts
```

## Install

```bash
npm install node-safe-env
```

## Quick Start

Define a schema:

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
```

Use it at runtime:

```ts
const env = createEnv(schema);

env.APP_NAME; // string
env.PORT; // number
env.DEBUG; // boolean
env.NODE_ENV; // "development" | "test" | "production"
```

What this gives you:

- `required: true` means the value must exist.
- `default` is used when a value is missing.
- `type` controls parsing and validation.
- returned `env` is strongly typed from your schema.

## What Is a Schema in node-safe-env?

A schema is an object where each key maps to a rule object.

Each rule describes:

- what type the value should be (`type`)
- whether it must be present (`required`)
- what to use if missing (`default`)
- optional rule-specific settings (for example enum values, array options, custom parser)

Use `defineEnv()` when you want better literal type inference and reusable exported schema modules.

```ts
// env.schema.ts
import { defineEnv } from "node-safe-env";

export const schema = defineEnv({
  PORT: { type: "port", default: 3000 },
  ADMIN_EMAIL: { type: "email", required: true },
} as const);
```

## CLI

`node-safe-env` includes:

- `validate`: validate current environment values against your schema
- `validate-example`: validate `.env.example` coverage against your schema

```bash
node-safe-env validate --schema ./env.schema.ts
node-safe-env validate-example --schema ./env.schema.ts
node-safe-env validate --schema ./dist/env.schema.js --strict
```

### CLI schema files

The `--schema` module supports both JavaScript and TypeScript files:

- JavaScript: `.js`, `.mjs`, `.cjs`
- TypeScript: `.ts`, `.mts`, `.cts`

Accepted export shapes:

- default export
- named export `schema`

## `.env.example` Validation

Validate a real file:

```ts
import { validateExampleEnvFile } from "node-safe-env";

const issues = validateExampleEnvFile(schema, {
  cwd: process.cwd(),
  exampleFile: ".env.example",
});
```

Validate an in-memory object:

```ts
import { validateExampleEnv } from "node-safe-env";

const issues = validateExampleEnv(schema, {
  PORT: "",
});
```

## Common Use Cases

- App startup validation: load and validate env once during bootstrap.
- CI checks for `.env.example`: fail PRs when required keys are missing or stale.
- Debugging source issues: use debug/tracing output to understand where values were loaded from.

## Value at a Glance

`node-safe-env` is a schema-based env validator with:

- TypeScript-friendly schema inference
- CLI commands for runtime and `.env.example` validation
- structured, aggregated validation errors
- source tracing and debug visibility

## Rule Types

Supported `type` values:

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

## Nested Schemas

Schemas can be nested. Env keys are flattened with `_` between segments.

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

## Loading Order

When `options.source` is not provided, values are merged in this order (last wins):

1. `.env`
2. `.env.local`
3. `.env.<NODE_ENV>`
4. custom file from `options.envFile`
5. `process.env`

## Debug Mode

```ts
import { createEnv, type EnvDebugReport } from "node-safe-env";

const reports: EnvDebugReport[] = [];

createEnv(schema, {
  debug: {
    logger: (report) => reports.push(report),
  },
});
```

Or:

```ts
createEnv(schema, { debug: true });
```

## Strict Mode

```ts
createEnv(schema, { strict: true });
```

Strict mode reports unknown environment keys as issues.

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

`createEnv(schema, options?)`:

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

## Development

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
