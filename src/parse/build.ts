import type { Matches } from "./matches/index.js";
import type { ParsableSchema } from "./parse.js";
import type { Unmatch, Unmatches } from "./unmatches.js";

export type BuildOutput = Array<BuildOutput> | string | boolean | undefined;

export function build(
  unmatches: Unmatches<ParsableSchema>,
  matches: Matches,
): BuildOutput {
  function walk(unmatch: Unmatch) {
    switch (unmatch.type) {
      case "string":
      case "boolean": {
        return matches.getByType(unmatch.ref, unmatch.type);
      }

      case "array": {
        return matches.has(unmatch.ref)
          ? matches.getByType(unmatch.ref, unmatch.type)
          : [];
      }

      case "strict_tuple": {
        const tuple: BuildOutput = [];

        for (const item of unmatch.items) {
          const match = walk(item);
          tuple.push(match);
        }

        return tuple;
      }

      case "optional": {
        return matches.has(unmatch.ref)
          ? matches.getByType(unmatch.ref, unmatch.type)
          : unmatch.default;
      }

      default: {
        throw new Error();
      }
    }
  }

  return walk(unmatches.value);
}
