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
  find,
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
  const unmatch = getUnmatchForOption(inputs.unmatches, token)

  // `--<identifier>=<value>`
  if (token.value !== undefined) {
    const match = getMatchForValue(unmatch, token)

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
  // `--identifier [value]`
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
    getUnmatchForValue(inputs.matches, inputs.unmatches)

  const match = getMatchForValue(unmatch, token)

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

export function getMatchForValue(
  unmatch: UnmatchesNodeString | UnmatchesNodeBoolean | UnmatchesNodeArray,
  token: ValueToken | OptionsShortValueToken | OptionLongValueToken
): string | boolean {
  switch (unmatch.type) {
    case "boolean": {
      return deriveBooleanFromValue(token.value)
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

export function getUnmatchForValue(matches: Matches, unmatches: Unmatches) {
  return find(unmatches, (unmatch) => {
    switch (unmatch.type) {
      case "string": {
        return (
          v.is(ArgValueMetadata, unmatch.metadata) && !matches.has(unmatch.ref)
        )
      }

      case "boolean": {
        return v.is(ArgOptionMetadata, unmatch.metadata)
      }

      default: {
        throw new Error()
      }
    }
  })
}

export function getUnmatchForOption(unmatches: Unmatches, token: OptionToken) {
  return find(unmatches, (unmatches) => {
    {
      if (!v.is(ArgOptionMetadata, unmatches.metadata)) {
        return false
      }

      const identifiers = token.short
        ? unmatches.metadata.shorts
        : unmatches.metadata.longs

      return identifiers.includes(token.identifier)
    }
  })
}

export function deriveBooleanFromValue(value: string) {
  if (value == "true" || value == "1") {
    return true
  }

  if (value == "false" || value == "0") {
    return false
  }

  throw new Error()
}
