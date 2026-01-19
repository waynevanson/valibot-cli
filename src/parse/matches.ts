import { ArgsToken, ArgsTokens, OptionToken } from "./arg-token"
import { ArgOptionMetadata } from "../methods/arg-metadata"
import { Unmatches, UnmatchesNodeString } from "./unmatches"
import * as v from "valibot"

interface MatchesState {
  matches: Matches
}

export class Matches extends Map<symbol, Match> {}

export type Match = {
  name: string
  value: MatchValue
}

// todo: add more after testing success
export type MatchValue = MatchValueString

export type MatchValueString = {
  type: "string"
  value: string
}

export type MatchValueBoolean = {
  type: "boolean"
  value: boolean | undefined
}

// basically add values
export function createMatches(
  unmatches: Unmatches,
  tokens: ArgsTokens
): Matches {
  function walk(state: MatchesState, token: ArgsToken): MatchesState {
    switch (token.type) {
      case "option": {
        // find node that as a value and a string
        const unmatch = getNodeForOptionValueString(unmatches, token)

        if (unmatch === undefined) {
          throw new Error()
        }

        if (token.value === undefined) {
          throw new Error()
        }

        const value: MatchValue = { type: "string", value: token.value }
        const match: Match = { name: unmatch.metadata.name, value }

        state.matches.set(unmatch.ref, match)
        break
      }

      default:
        throw new Error()
    }

    return state
  }

  const state = tokens.reduce(
    (state: MatchesState, token) => walk(state, token),
    { matches: new Matches() }
  )

  // validate we've iterated through all required values
  // in unmatches

  return state.matches
}

export function getNodeForOptionValueString(
  unmatches: Unmatches,
  token: OptionToken
) {
  function walk(unmatches: Unmatches): UnmatchesNodeString | undefined {
    switch (unmatches.type) {
      case "string": {
        if (!v.is(ArgOptionMetadata, unmatches.metadata)) {
          console.log("brok")
          break
        }

        const identifiers = token.short
          ? unmatches.metadata.shorts
          : unmatches.metadata.longs

        if (!identifiers.includes(token.identifier)) {
          break
        }

        return unmatches
      }

      case "strict_tuple": {
        for (const item of unmatches.items) {
          const unmatch = walk(item)

          if (unmatch !== undefined) {
            return unmatch
          }
        }
      }

      default: {
        throw new Error()
      }
    }

    return undefined
  }

  return walk(unmatches)
}
