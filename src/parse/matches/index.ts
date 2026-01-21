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

  for (const token of tokens) {
    const matched = getMatched(matches, previous, token, unmatches)

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

  const unmatch = previous.get()

  if (unmatch !== undefined) {
    // no more tokens, resolve the optional flag
    matches.set(unmatch.ref, true)
  }

  return matches
}

type Matched =
  | { type: "previous"; unmatch: UnmatchesLeaf }
  | { type: "matched"; match: string | boolean; unmatch: UnmatchesLeaf }

// adding to matches only once
// todo: values
function getMatched(
  matches: Matches,
  previous: Only<UnmatchesLeaf>,
  token: ArgsToken,
  unmatches: Unmatches
): Matched {
  switch (token.type) {
    case "option": {
      const unmatch = getNodeForOptionString(unmatches, token)

      if (token.value === undefined) {
        // `--<identifier>`

        // todo: booleans where values are optional
        if (unmatch.type === "boolean" && unmatch.value !== "required") {
          return {
            type: "matched",
            unmatch,
            match: true
          }
        } else {
          return {
            type: "previous",
            unmatch
          }
        }
      } else {
        // todo: push a value into the matches
        // `--<identifier>=<value>`
        const match = createMatchValue(unmatch, token)

        return {
          type: "matched",
          unmatch,
          match
        }
      }
    }

    case "value": {
      const unmatch =
        previous.get() ?? getNodeValueForString(matches, unmatches)

      const match = createMatchValue(unmatch, token)

      return {
        type: "matched",
        match,
        unmatch
      }
    }

    default:
      throw new Error()
  }
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
