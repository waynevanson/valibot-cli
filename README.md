# `@waynevanson/cli`

A valibot powered CLI.

## Execution flow

1. Transform `process.argv.slice(2)` (or whatever strings you pass in) into a list of context free tokens.
2. Validates the schema containing CLI metadata.
3. Parses the context free tokens with schema to construct `Input` type of CLI.
4. Applies parser to CLI output.
