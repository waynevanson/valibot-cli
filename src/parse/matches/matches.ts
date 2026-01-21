import type { UnmatchesLeaf } from "../unmatches.js";

export type Match = string | boolean | Array<string>;

export class Matches {
  map = new Map<symbol, Match>();

  getByType(ref: symbol, type: UnmatchesLeaf["type"]) {
    if (!this.map.has(ref)) {
      throw new Error();
    }

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
