import { ArgsToken, ArgsTokens, OptionToken, ValueToken } from "./arg-token.js"
import { ArgOptionMetadata, ArgValueMetadata } from "../methods/arg-metadata.js"
import { Unmatches, UnmatchesNodeString } from "./unmatches.js"
import * as v from "valibot"
import { isBoundInRange } from "../utils/number.js"

// todo: an unmatches structure where I can add existing values to
class MatchesState {
  matches = new Matches()
  previous: undefined | UnmatchesNodeString = undefined

  // consume the previous match if it existed
  prev() {
    if (this.previous === undefined) {
      return undefined
    }

    const unmatch = this.previous
    this.previous = undefined

    return unmatch
  }
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
        const unmatch = getNodeForOptionString(unmatches, token)

        if (token.value === undefined) {
          if (unmatch.value === "none") {
            throw new Error()
          }

          state.previous = unmatch

          break
        }

        const value: MatchValue = {
          type: "string",
          value: token.value
        }
        const match: Match = { name: unmatch.metadata.name, value }
        state.matches.set(unmatch.ref, match)
        break
      }

      case "value": {
        const unmatch = state.prev() ?? getNodeValueForString(state, unmatches)
        console.log(unmatch)

        const value: MatchValue = {
          type: "string",
          value: token.value
        }
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
    (state, token) => walk(state, token),
    new MatchesState()
  )

  return state.matches
}

export function getNodeValueForString(
  state: MatchesState,
  unmatches: Unmatches
) {
  function walk(unmatches: Unmatches): UnmatchesNodeString | undefined {
    switch (unmatches.type) {
      case "string": {
        if (!v.is(ArgValueMetadata, unmatches.metadata)) {
          break
        }

        const match = state.matches.get(unmatches.ref)

        if (match !== undefined) {
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

  const value = walk(unmatches)

  if (value === undefined) {
    throw new Error()
  }

  return value
}

export function getNodeForOptionString(
  unmatches: Unmatches,
  token: OptionToken
) {
  function walk(unmatches: Unmatches): UnmatchesNodeString | undefined {
    switch (unmatches.type) {
      case "string": {
        if (!v.is(ArgOptionMetadata, unmatches.metadata)) {
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

  const value = walk(unmatches)

  if (value === undefined) {
    throw new Error()
  }

  return value
}
