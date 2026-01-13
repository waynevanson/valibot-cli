import * as v from "valibot"
import {
  ArgMethod,
  ArgOptionMetadata,
  ArgValueMetadata,
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
  v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
  ArgValueMetadata | ArgOptionMetadata
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

      let multiple = false
      let value: undefined | string = undefined
      for (const match of matches.args) {
        if (match.name === metadata.name) {
          if (value !== undefined) {
            multiple = true
          }
          value = match.value
        }
      }

      if (value === undefined) {
        throw new Error()
      }

      if (multiple) {
        throw new Error()
      }

      return value
      break
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
