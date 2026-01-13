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

export function createMatches<TSchema extends ParsableSchema>(
  schema: TSchema,
  tokens: ArgTokens
): Matches {
  const matches: Matches = { args: [], subcommand: undefined }

  let requiresValue = false

  for (const token of tokens) {
    switch (token.type) {
      case "option": {
        const metadata = getArgMethodMetadata(schema)

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

        const metadata = getArgMethodMetadata(schema)

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
