import {
  ValueToken,
  OptionsShortValueToken,
  OptionLongValueToken
} from "../tokens/args.js"
import {
  UnmatchesNodeString,
  UnmatchesNodeBoolean,
  UnmatchesNodeArray
} from "../unmatches.js"

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

export function deriveBooleanFromValue(value: string) {
  if (value == "true" || value == "1") {
    return true
  }

  if (value == "false" || value == "0") {
    return false
  }

  throw new Error()
}
