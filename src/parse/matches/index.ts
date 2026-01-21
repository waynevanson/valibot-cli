import * as v from "valibot"
import {
  ArgOptionMetadata,
  ArgValueMetadata
} from "../../methods/arg-metadata.js"
import {
  ArgsToken,
  ArgsTokens,
  OptionLongValueToken,
  OptionsShortValueToken,
  OptionToken,
  ValueToken
} from "../arg-token.js"
import {
  Unmatches,
  UnmatchesLeaf,
  UnmatchesNodeArray,
  UnmatchesNodeBoolean,
  UnmatchesNodeString
} from "../unmatches.js"
import { Matches, MatchesState } from "./matches-state.js"
import { Only } from "../../utils/only.js"

export function createMatches(
  unmatches: Unmatches,
  tokens: ArgsTokens
): Matches {
  const state = tokens.reduce((state, token) => walk(state, token, unmatches), {
    matches: new Matches(),
    previous: new Only<UnmatchesLeaf>()
  } satisfies MatchesState)

  const prev = state.previous.get()

  if (prev !== undefined) {
    // no more tokens, resolve the optional flag
    state.matches.set(prev.ref, true)
  }

  return state.matches
}

// adding to matches only once
function walk(
  state: MatchesState,
  token: ArgsToken,
  unmatches: Unmatches
): MatchesState {
  switch (token.type) {
    case "option": {
      const unmatch = getNodeForOptionString(unmatches, token)

      if (token.value === undefined) {
        // `--<identifier>`

        // todo: booleans where values are optional
        if (unmatch.type === "boolean" && unmatch.value !== "required") {
          state.matches.set(unmatch.ref, true)
        } else {
          state.previous.set(unmatch)
        }
      } else {
        // todo: push a value into the matches
        // `--<identifier>=<value>`
        const match = createMatchValue(unmatch, token)

        // refactor this into something probably
        state.matches.add(unmatch, match)
      }

      break
    }

    case "value": {
      const unmatch =
        state.previous.get() ?? getNodeValueForString(state.matches, unmatches)

      const match = createMatchValue(unmatch, token)

      state.matches.add(unmatch, match)

      break
    }

    default:
      throw new Error()
  }

  return state
}

function createMatchValue(
  unmatch: UnmatchesNodeString | UnmatchesNodeBoolean | UnmatchesNodeArray,
  token: ValueToken | OptionsShortValueToken | OptionLongValueToken
): string | boolean {
  switch (unmatch.type) {
    case "boolean": {
      const value = deriveBooleanFromValue(token.value)

      if (value === undefined) {
        throw new Error()
      }

      return value
    }

    case "string":
    case "array": {
      return token.value
    }

    default: {
      throw new Error()
    }
  }
}

export function getNodeValueForString(matches: Matches, unmatches: Unmatches) {
  function walk(
    unmatches: Unmatches
  ): UnmatchesNodeString | UnmatchesNodeBoolean | undefined {
    switch (unmatches.type) {
      case "string": {
        if (!v.is(ArgValueMetadata, unmatches.metadata)) {
          break
        }

        if (matches.has(unmatches.ref)) {
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
  ):
    | UnmatchesNodeString
    | UnmatchesNodeBoolean
    | UnmatchesNodeArray
    | undefined {
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
        break
      }

      case "array": {
        const identifiers = token.short
          ? unmatches.metadata.shorts
          : unmatches.metadata.longs

        if (!identifiers.includes(token.identifier)) {
          break
        }

        return unmatches
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

function deriveBooleanFromValue(value: string) {
  if (value == "true" || value == "1") {
    return true
  }

  if (value == "false" || value == "0") {
    return false
  }

  return undefined
}
