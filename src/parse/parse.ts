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
    case "string":
    case "number": {
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

      switch (schema.type) {
        case "number":
          return Number(match.value)
        case "string":
          return match.value
        default:
          throw new Error()
      }
    }

    case "array": {
      // todo: why does this not self extract?
      const schema_ = schema as Extract<
        typeof schema,
        ArgMethod<ParsableContainerSchema, ArgOptionMetadata>
      >

      const metadata = getArgMethodMetadata(schema)

      if (!isArgOptionMetadata(metadata)) {
        throw new Error()
      }

      return matches.args
        .filter((match) => match.name === metadata.name)
        .map((match) => {
          switch (schema_.item.type) {
            case "string":
              return match.value
            case "number":
              return Number(match.value)
            default: {
              throw new Error()
            }
          }
        })
    }

    default: {
      throw new Error()
    }
  }
}

function coerceFromString() {}

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
