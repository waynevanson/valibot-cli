import { ArgsToken, ArgsTokens, OptionToken, ValueToken } from "./arg-token.js"
import { ArgOptionMetadata, ArgValueMetadata } from "../methods/arg-metadata.js"
import {
  Unmatches,
  UnmatchesNodeBoolean,
  UnmatchesNodeString
} from "./unmatches.js"
import * as v from "valibot"

class MatchesState {
  matches = new Matches()
  previous: undefined | UnmatchesNodeString | UnmatchesNodeBoolean = undefined

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
export type MatchValue = MatchValueString | MatchValueBoolean

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
          // `--<identifier>`

          if (unmatch.type === "boolean") {
            const value: MatchValueBoolean = { type: "boolean", value: true }
            const match: Match = { name: unmatch.metadata.name, value }
            state.matches.set(unmatch.ref, match)
          } else {
            state.previous = unmatch
          }
        } else {
          // `--<identifier>=<value>`
          if (unmatch.type === "boolean") {
            const coerced =
              token.value == "true" || token.value == "1"
                ? true
                : token.value == "false" || token.value == "0"
                  ? false
                  : undefined

            if (coerced === undefined) {
              throw new Error()
            }

            const value: MatchValueBoolean = { type: "boolean", value: coerced }
            const match: Match = { name: unmatch.metadata.name, value }
            state.matches.set(unmatch.ref, match)
          } else {
            const value: MatchValueString = {
              type: "string",
              value: token.value
            }
            const match: Match = { name: unmatch.metadata.name, value }
            state.matches.set(unmatch.ref, match)
          }
        }

        break
      }

      case "value": {
        const unmatch = state.prev() ?? getNodeValueForString(state, unmatches)

        const value: MatchValueString = {
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
  function walk(
    unmatches: Unmatches
  ): UnmatchesNodeString | UnmatchesNodeBoolean | undefined {
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

      case "boolean": {
        if (!v.is(ArgOptionMetadata, unmatches.metadata)) {
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
  function walk(
    unmatches: Unmatches
  ): UnmatchesNodeString | UnmatchesNodeBoolean | undefined {
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
      case "boolean": {
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
