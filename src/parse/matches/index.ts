import * as v from "valibot"
import {
  ArgOptionMetadata,
  ArgValueMetadata
} from "../../methods/arg-metadata.js"
import { Only } from "../../utils/only.js"
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
import { Matches } from "./matches-state.js"

export function createMatches(
  unmatches: Unmatches,
  tokens: ArgsTokens
): Matches {
  const matches = new Matches()
  const previous = new Only<UnmatchesLeaf>()

  const inputs: GetMatchedInputs = { matches, previous, unmatches }

  for (const token of tokens) {
    const matched = getMatched(token, inputs)

    switch (matched.type) {
      case "previous": {
        previous.set(matched.unmatch)
        break
      }

      case "matched": {
        matches.add(matched.unmatch, matched.match)
        break
      }

      default: {
        throw new Error()
      }
    }
  }

  // resolve the flag as a boolean if we had one

  const unmatch = previous.get()

  if (unmatch !== undefined) {
    matches.set(unmatch.ref, true)
  }

  return matches
}

export type Matched =
  | { type: "previous"; unmatch: UnmatchesLeaf }
  | { type: "matched"; match: string | boolean; unmatch: UnmatchesLeaf }

export function getMatchedForOption(
  token: OptionToken,
  inputs: GetMatchedInputs
): Matched {
  const unmatch = getNodeForOptionString(inputs.unmatches, token)

  if (token.value !== undefined) {
    // `--<identifier>=<value>`
    const match = deriveMatchValue(unmatch, token)

    return {
      type: "matched",
      unmatch,
      match
    }
  }

  // `--<identifier>`
  // todo: booleans where values are optional
  if (unmatch.type === "boolean" && unmatch.value !== "required") {
    return {
      type: "matched",
      unmatch,
      match: true
    }
  }

  // schema expects this to have a value
  return {
    type: "previous",
    unmatch
  }
}

export function getMatchedForValue(
  token: ValueToken,
  inputs: GetMatchedInputs
): Matched {
  const unmatch =
    inputs.previous.get() ??
    getNodeValueForString(inputs.matches, inputs.unmatches)

  const match = deriveMatchValue(unmatch, token)

  return {
    type: "matched",
    match,
    unmatch
  }
}

export interface GetMatchedInputs {
  matches: Matches
  previous: Only<UnmatchesLeaf>
  unmatches: Unmatches
}

export function getMatched(
  token: ArgsToken,
  inputs: GetMatchedInputs
): Matched {
  switch (token.type) {
    case "option": {
      return getMatchedForOption(token, inputs)
    }

    case "value": {
      return getMatchedForValue(token, inputs)
    }

    default:
      throw new Error()
  }
}

export function deriveMatchValue(
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

        // exists.
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
