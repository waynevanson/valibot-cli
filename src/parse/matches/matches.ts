import { Only } from "../../utils/only.js";
import type { ArgsTokens } from "../tokens/args.js";
import type { Unmatches, UnmatchesLeaf } from "../unmatches.js";
import { type GetMatchedInputs, getMatched } from "./matched.js";

export type Match = string | boolean | Array<string>;

export class Matches {
  map = new Map<symbol, Match>();

  constructor(unmatches: Unmatches, tokens: ArgsTokens) {
    const previous = new Only<UnmatchesLeaf>();

    const inputs: GetMatchedInputs = { matches: this, previous, unmatches };

    for (const token of tokens) {
      const matched = getMatched(token, inputs);

      switch (matched.type) {
        case "previous": {
          previous.set(matched.unmatch);
          break;
        }

        case "matched": {
          this.add(matched.unmatch, matched.match);
          break;
        }

        default: {
          throw new Error();
        }
      }
    }

    // resolve the flag as a boolean if we had one
    const unmatch = previous.get();

    if (unmatch !== undefined) {
      this.set(unmatch.ref, true);
    }
  }

  getByType(ref: symbol, type: UnmatchesLeaf["type"]) {
    if (!this.map.has(ref)) {
      throw new Error();
    }

    // biome-ignore lint/style/noNonNullAssertion: Asserted above
    const value = this.map.get(ref)!;

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
      default: {
        throw new Error();
      }
    }

    return value;
  }

  has(ref: symbol) {
    return this.map.has(ref);
  }

  set(ref: symbol, value: string | boolean) {
    if (this.map.has(ref)) {
      throw new Error();
    }

    return this.map.set(ref, value);
  }

  append(ref: symbol, ...values: Array<string>) {
    if (values.length <= 0) {
      throw new Error();
    }

    if (!this.map.has(ref)) {
      return this.map.set(ref, values);
    }

    const existing = this.map.get(ref);

    if (!Array.isArray(existing)) {
      throw new Error();
    }

    existing.push(...values);
  }

  add(unmatch: UnmatchesLeaf, match: string | boolean) {
    if (unmatch.type === "array") {
      if (typeof match !== "string") {
        throw new Error();
      }

      this.append(unmatch.ref, ...match.split(","));
    } else {
      this.set(unmatch.ref, match);
    }
  }
}
