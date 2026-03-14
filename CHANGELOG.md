# Changelog

## 0.1.0

- Initial scaffold
- MVP core API draft
- `.env` loading
- string/number/boolean/enum parsing
- required/default/empty-string handling
- nested schema support
- `url`, `port`, `json`, `int`, `float`, `array`, and `custom` validators
- aggregated validation errors
- strict mode for unknown environment keys
- `.env.example` validation helpers
- masking support for sensitive values
- source tracing utilities
- added `email` validator
- added `date` validator
- defaults are now parsed through the same validation pipeline before being added to the final output
- added CLI with `validate` and `validate-example` commands
