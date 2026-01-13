import * as v from "valibot"
import {
  ArgMethod,
  ArgOptionMetadata,
  getArgMethodMetadata,
  isArgOptionMetadata
} from "../methods"
import { findExactlyOne } from "../utils"
import { createArgsTokens } from "./arg-token"
import { createMatches, Matches } from "./matches"

// at the start we allow all args
// but we eventually it gets narrowed down

function stringify(type: ParsablePrimitiveSchema["type"], value: string) {
  switch (type) {
    case "number":
      return Number(value)
    case "string":
      return value
    default:
      throw new Error()
  }
}

export type ParsablePrimitiveSchema =
  | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
  | v.NumberSchema<v.ErrorMessage<v.NumberIssue> | undefined>

export type ParsableContainerSchema = v.ArraySchema<
  ParsablePrimitiveSchema,
  v.ErrorMessage<v.ArrayIssue> | undefined
>

export type ParsableSchema = ArgMethod<
  ParsablePrimitiveSchema | ParsableContainerSchema,
  ArgOptionMetadata
>

export function parse<TSchema extends ParsableSchema>(
  schema: TSchema,
  args: Array<string>
): v.InferInput<TSchema> {
  const tokens = createArgsTokens(args)
  const matches = createMatches(schema, tokens)
  const input = build(schema, matches)
  return input
}

export function build<TSchema extends ParsableSchema>(
  schema: TSchema,
  matches: Matches
): v.InferInput<TSchema> {
  switch (schema.type) {
    case "string":
    case "number": {
      const metadata = getArgMethodMetadata(schema)

      if (!isArgOptionMetadata(metadata)) {
        throw new Error()
      }

      const match = findExactlyOne(
        matches.args,
        (value) => value.name === metadata.name
      )

      if (match === undefined) {
        throw new Error()
      }

      return stringify(schema.type, match.value)
    }

    case "array": {
      // todo: why does this not self extract?
      const schema_ = schema as Extract<
        typeof schema,
        ArgMethod<ParsableContainerSchema, ArgOptionMetadata>
      >

      const metadata = getArgMethodMetadata(schema_)

      if (!isArgOptionMetadata(metadata)) {
        throw new Error()
      }

      return matches.args
        .filter((match) => match.name === metadata.name)
        .map((match) => stringify(schema_.item.type, match.value))
    }

    default: {
      throw new Error()
    }
  }
}

// add a predicate
export function findSchema<TSchema extends ParsableSchema>(schema: TSchema) {
  return schema
}
