import { ArgMetadata, ArgOptionMetadata, ArgValueMetadata } from "../methods"
import {
  ArgsToken,
  OptionLongToken,
  OptionShortToken,
  OptionToken
} from "./arg-token"
import { Unmatches, UnmatchesNodeArg } from "./unmatches"

interface MatchesState {
  matches: Matches
}

export interface Matches extends Map<
  symbol,
  { name: string; values: Array<string> }
> {}

export type Match = UnmatchesNodeArg<ArgOptionMetadata | ArgValueMetadata> & {
  value: string
}

// basically add values
export function createMatches(
  unmatches: Unmatches,
  tokens: Array<ArgsToken>
): Matches {
  function walk(state: MatchesState, token: ArgsToken): MatchesState {
    switch (token.type) {
      case "option": {
        // find node that as a value and a string
        const node = getNodeForOptionValueString(unmatches, token)

        if (node === undefined) {
          throw new Error()
        }

        // `--<identifier>=<value>`
        state.matches.set(node.id, node)

        return new Map()
      }

      default:
        throw new Error()
    }
  }

  const state = tokens.reduce(
    (state: MatchesState, token) => walk(state, token),
    { matches: new Map() }
  )

  // validate we've iterated through all required values
  // in unmatches

  return state.matches
}

export function getNodeForOptionValueString(
  unmatches: Unmatches,
  token: OptionToken
) {
  for (const node of unmatches.args.value) {
    if (node.metadata.type !== "option") {
      continue
    }

    const identifiers = token.short ? node.metadata.shorts : node.metadata.longs

    if (identifiers.includes(token.identifier)) {
      return node
    }
  }
}
