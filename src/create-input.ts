import { createArgsResolved } from "./create-args-resolved"
import { CommandableSchemaKind, createArgMatches } from "./create-arg-matches"
import { createArgsTokens } from "./tokens"
import { resolve } from "path"
import * as v from "valibot"

// Build the input value based on the schema and CLI args
export function createInput<TSchema extends CommandableSchemaKind>(
  schema: TSchema,
  args: Array<string>
): v.InferInput<TSchema> {
  const matches = createArgMatches(schema)
  const tokens = createArgsTokens(args)
  const resolved = createArgsResolved(matches, tokens)

  // build - walk schema and build a resolveable input type.

  switch (schema.type) {
    case "string":
    case "number": {
      if (resolved.length !== 1) {
        throw new Error(
          "Expected resolved to only have 1 resolved for a string or number"
        )
      }

      const { schema } = matches.find((a) => a.id === resolved[0].id)!
      return resolved[0].value
      break
    }
    case "strict_object":
      break
    case "variant":
      break

    default:
      const _: never = schema
  }
  throw new Error("cooked")
}
