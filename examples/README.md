# Examples

This folder contains small runnable examples aligned with the current `node-safe-env` feature set.

## basic

File: `examples/basic/index.ts`

Shows:

- required string
- port parsing
- boolean parsing
- enum parsing

## nested

File: `examples/nested/index.ts`

Shows:

- nested schema shape
- flattened env key mapping (`SERVER_PORT`, `DATABASE_URL`)
- nested parsed output usage (`env.server.port`, `env.database.url`)

## advanced

File: `examples/advanced/index.ts`

Shows:

- `defineEnv()`
- `email` and `date` validators
- array options (`separator`, `trimItems`, `allowEmptyItems`)
- functional defaults
- `sensitive: true` with `maskEnv()`
- debug mode with `debug: { logger }`

## cli-schema

File: `examples/cli-schema/env.schema.ts`

Schema module intended for CLI usage:

- `node-safe-env validate --schema ...`
- `node-safe-env validate-example --schema ...`
