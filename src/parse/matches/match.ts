import type {
  OptionLongValueToken,
  OptionsShortValueToken,
  ValueToken,
} from "../tokens/index.js";
import type { UnmatchLeaf } from "../unmatches.js";

export function getMatchForValue(
  unmatch: UnmatchLeaf,
  token: ValueToken | OptionsShortValueToken | OptionLongValueToken,
): string | boolean {
  switch (unmatch.type) {
    case "boolean": {
      return deriveBooleanFromValue(token.value);
    }

    case "string":
    case "optional":
    case "array": {
      return token.value;
    }

    default: {
      throw new Error();
    }
  }
}

export function deriveBooleanFromValue(value: string) {
  if (value === "true" || value === "1") {
    return true;
  }

  if (value === "false" || value === "0") {
    return false;
  }

  throw new Error();
}
