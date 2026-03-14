# Changelog

## 0.1.0

Initial public release.

### Core runtime

- schema-based env loading with `.env`, `.env.local`, `.env.<NODE_ENV>`, custom file, and `process.env` precedence
- nested schema support with flattened env keys
- typed parsed output with optional/required key inference
- aggregated validation errors via `EnvValidationError`
- strict mode for unknown environment keys
- `defineEnv()` helper for stable schema typing

### Validators

Built-in validators:

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

Additional validator features:

- advanced array parsing (`separator`, `trimItems`, `allowEmptyItems`)
- defaults processed through the full validator pipeline
- functional defaults
- structured `invalid_default` validation issue when a default function throws

### Observability and safety

- debug mode in `createEnv` with structured debug report output
- sensitive value masking via `sensitive: true`
- `maskEnv()` helper for safe logging
- source tracing utilities via `traceEnv()`

### CLI and tooling

- CLI commands:
  - `validate`
  - `validate-example`
- `.env.example` validation helpers:
  - `validateExampleEnv`
  - `validateExampleEnvFile`
- TypeScript declarations included
- ESM + CJS builds
- example projects
- CI workflow
