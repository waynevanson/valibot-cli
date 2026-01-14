import { getArgMethodMetadata, isArgOptionMetadata } from "../methods"
import {
  ArgTokens,
  OptionLongToken,
  OptionShortToken,
  OptionToken
} from "./arg-token"
import { ParsableSchema } from "./parse"

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

export function findArgMethodMetadataByName<TSchema extends ParsableSchema>(
  schema: TSchema,
  token: OptionToken
) {
  switch (schema.type) {
    case "array":
    case "number":
    case "string":
      return getArgMethodMetadata(schema)
    case "strict_tuple":
      for (const item of schema.items) {
        const metadata = getArgMethodMetadata(item)
        const values = token.short ? metadata.shorts : metadata.longs
        if (values.includes(token.identifier)) {
          return metadata
        }
      }
      throw new Error()
    default: {
      throw new Error()
    }
  }
}

export function createMatches<TSchema extends ParsableSchema>(
  schema: TSchema,
  tokens: ArgTokens
): Matches {
  const matches: Matches = { args: [], subcommand: undefined }

  let previousShortToken: undefined | OptionShortToken | OptionLongToken

  for (const token of tokens) {
    switch (token.type) {
      case "option": {
        if (token.value === undefined) {
          previousShortToken = token
        } else {
          const metadata = findArgMethodMetadataByName(schema, token)

          if (!isArgOptionMetadata(metadata)) {
            throw new Error()
          }

          matches.args.push({ name: metadata.name, value: token.value })
        }

        break
      }
      case "value": {
        if (previousShortToken === undefined) {
          if (schema.type !== "string") {
            throw new Error()
          }

          const metadata = getArgMethodMetadata(schema)

          // normal flag
          matches.args.push({ name: metadata.name, value: token.value })
        } else {
          const metadata = findArgMethodMetadataByName(
            schema,
            previousShortToken
          )

          if (!isArgOptionMetadata(metadata)) {
            throw new Error()
          }

          matches.args.push({ name: metadata.name, value: token.value })
          previousShortToken = undefined
        }

        break
      }
      default:
        throw new Error()
    }
  }

  if (previousShortToken !== undefined) {
    throw new Error()
  }

  return matches
}
