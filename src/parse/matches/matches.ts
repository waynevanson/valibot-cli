import { Only } from "../../utils/only.js";
import type { ParsableSchema } from "../parse.js";
import type { ArgsTokens } from "../tokens/args.js";
import type { Unmatches, UnmatchLeaf } from "../unmatches.js";
import { type GetMatchedInputs, getMatched } from "./matched.js";

export type Match = string | boolean | Array<string> | undefined;

export function collectMatches(
  matches: Matches,
  unmatches: Unmatches<ParsableSchema>,
  tokens: ArgsTokens,
) {
  const previous = new Only<UnmatchLeaf>();

  const inputs: GetMatchedInputs = {
    matches,
    previous,
    unmatches,
  };

  for (const token of tokens) {
    getMatched(token, inputs);
  }

  // resolve the flag as a boolean if we had one
  const unmatch = previous.get();

  if (unmatch === undefined) {
    return;
  }

  // `--identifier [value]` but value is missing
  switch (unmatch.type) {
    case "boolean": {
      matches.set(unmatch.ref, true);
      break;
    }

    case "exact_optional": {
      matches.set(unmatch.ref, unmatch.default);
      break;
    }

    default: {
      throw new Error();
    }
  }
}

export class Matches {
  #map = new Map<symbol, Match>();

  get(ref: symbol) {
    if (!this.#map.has(ref)) {
      throw new Error();
    }

    // biome-ignore lint/style/noNonNullAssertion: Asserted above
    const value = this.#map.get(ref)!;

    return value;
  }

  getByType(ref: symbol, type: UnmatchLeaf["type"]) {
    const value = this.get(ref);
    switch (type) {
      case "boolean":
      case "string":
        if (typeof value !== type) {
          throw new Error();
        }
        break;

      case "array":
        if (!Array.isArray(value)) {
          throw new Error();
        }
        break;

      case "exact_optional":
      case "optional":
      case "nullable": {
        return value;
      }
      default: {
        throw new Error();
      }
    }

    return value;
  }

  has(ref: symbol) {
    return this.#map.has(ref);
  }

  set(ref: symbol, value: string | boolean | undefined) {
    if (this.#map.has(ref)) {
      throw new Error();
    }

    return this.#map.set(ref, value);
  }

  append(ref: symbol, ...values: Array<string>) {
    if (values.length <= 0) {
      throw new Error();
    }

    if (!this.#map.has(ref)) {
      return this.#map.set(ref, values);
    }

    const existing = this.#map.get(ref);

    if (!Array.isArray(existing)) {
      throw new Error();
    }

    existing.push(...values);
  }

  add(unmatch: UnmatchLeaf, match: string | boolean) {
    if (unmatch.type === "array") {
      if (typeof match !== "string") {
        throw new Error();
      }

      const m = unmatch.metadata.type === "option" ? match.split(",") : [match];

      this.append(unmatch.ref, ...m);
    } else {
      this.set(unmatch.ref, match);
    }
  }
}
