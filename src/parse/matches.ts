import { getArgMethodMetadata, isArgOptionMetadata } from "../methods"
import { ArgTokens, OptionLongToken, OptionShortToken } from "./arg-token"
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
  options: { short: boolean; name: string }
) {
  switch (schema.type) {
    case "array":
    case "number":
    case "string":
      return getArgMethodMetadata(schema)
    case "strict_tuple":
      for (const item of schema.items) {
        const metadata = getArgMethodMetadata(item)
        const values = options.short ? metadata.shorts : metadata.longs
        if (values.includes(options.name)) {
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

  let requiresValue = false

  for (const token of tokens) {
    switch (token.type) {
      case "option": {
        const metadata = findArgMethodMetadataByName(schema, {
          short: token.short,
          name: token.identifier
        })

        if (!isArgOptionMetadata(metadata)) {
          throw new Error()
        }

        if (token.value === undefined) {
          requiresValue = true
        } else {
          matches.args.push({ name: metadata.name, value: token.value })
        }

        break
      }
      case "value": {
        if (!requiresValue) {
          throw new Error()
        }

        const metadata = findArgMethodMetadataByName(schema, {
          short: token.short,
          name: token.identifier
        })

        if (!isArgOptionMetadata(metadata)) {
          throw new Error()
        }

        matches.args.push({ name: metadata.name, value: token.value })
        requiresValue = false

        break
      }
      default:
        throw new Error()
    }
  }

  if (requiresValue) {
    throw new Error()
  }

  return matches
}
