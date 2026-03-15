# Changelog

All notable changes to this project will be documented in this file.

## 0.1.3

### CLI

- Added support for TypeScript schema modules in the CLI (`.ts`, `.mts`, `.cts`)
- Improved schema module loading logic for CLI commands
- Fixed CLI direct-run behavior so `node-safe-env --help` works correctly
- Improved CLI usability and error handling

### Documentation

- Expanded README with clearer CLI usage examples
- Added explanation of nested schema key flattening behavior
- Improved `.env.example` validation documentation
- Added badges and improved quick start section

### Examples

- Improved example projects
- Added CLI schema example for `validate` and `validate-example`

---

## 0.1.2

### CLI

- Fixed CLI shebang handling so the command works correctly when executed via `npx`
- Improved CLI command help output

### Documentation

- Improved README structure and clarity
- Added more CLI usage examples

### Tooling

- Minor project structure cleanup
- CI improvements

---

## 0.1.1

### CLI

- Fixed CLI execution issues when installed or executed via `npx`
- Improved CLI entrypoint behavior

### Documentation

- Documentation improvements and cleanup

---

## 0.1.0

Initial public release.

### Core runtime

- Schema-based env loading with `.env`, `.env.local`, `.env.<NODE_ENV>`, custom file, and `process.env` precedence
- Nested schema support with flattened env keys
- Typed parsed output with optional/required key inference
- Aggregated validation errors via `EnvValidationError`
- Strict mode for unknown environment keys
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

- Advanced array parsing (`separator`, `trimItems`, `allowEmptyItems`)
- Defaults processed through the full validator pipeline
- Functional defaults
- Structured `invalid_default` validation issue when a default function throws

### Observability and safety

- Debug mode in `createEnv` with structured debug report output
- Sensitive value masking via `sensitive: true`
- `maskEnv()` helper for safe logging
- Source tracing utilities via `traceEnv()`

### CLI and tooling

- CLI commands:
  - `validate`
  - `validate-example`
- `.env.example` validation helpers:
  - `validateExampleEnv`
  - `validateExampleEnvFile`
- TypeScript declarations included
- ESM + CJS builds
- Example projects
- CI workflow
