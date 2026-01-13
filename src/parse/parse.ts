import * as v from "valibot"
import {
  ArgMethod,
  ArgOptionMetadata,
  getArgMethodMetadata,
  isArgOptionMetadata
} from "../methods"
import { createArgsTokens } from "./arg-token"

// at the start we allow all args
// but we eventually it gets narrowed down
export type Args = Array<{
  name: string
  value: string
}>

export interface Matches {
  args: Args
  subcommand:
    | undefined
    | {
        name: string
        matches: Matches
      }
}

export type ParsableSchema = ArgMethod<
  | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
  | v.ArraySchema<
      v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
      v.ErrorMessage<v.ArrayIssue> | undefined
    >,
  ArgOptionMetadata
>

export function parse<TSchema extends ParsableSchema>(
  schema: TSchema,
  args: Array<string>
): v.InferInput<TSchema> {
  const tokens = createArgsTokens(args)

  const matches: Matches = { args: [], subcommand: undefined }

  for (const token of tokens) {
    switch (token.type) {
      case "option": {
        if (token.short || token.value === undefined) {
          throw new Error()
        }

        const metadata = getArgMethodMetadata(schema)

        if (!isArgOptionMetadata(metadata)) {
          throw new Error()
        }

        matches.args.push({ name: metadata.name, value: token.value })

        break
      }
      default:
        throw new Error()
    }
  }

  // build data here

  switch (schema.type) {
    case "string": {
      const metadata = getArgMethodMetadata(schema)

      if (!isArgOptionMetadata(metadata)) {
        throw new Error()
      }

      const match = findOnlyOne(
        matches.args,
        (value) => value.name === metadata.name
      )

      if (match === undefined) {
        throw new Error()
      }

      return match.value
    }
    case "array": {
      const metadata = getArgMethodMetadata(schema)

      if (!isArgOptionMetadata(metadata)) {
        throw new Error()
      }

      const match = findOnlyOne(
        matches.args,
        (value) => value.name === metadata.name
      )

      if (match === undefined) {
        throw new Error()
      }

      return [match.value]
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

function findOnlyOne<T, F extends (value: T) => boolean>(
  array: Array<T>,
  predicate: F
): T | undefined {
  let multiple = false
  let value: undefined | T = undefined
  for (const item of array) {
    if (predicate(item)) {
      if (value !== undefined) {
        multiple = true
      }
      value = item
    }
  }

  if (multiple) {
    throw new Error()
  }

  return value
}
