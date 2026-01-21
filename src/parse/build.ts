import type { Matches } from "./matches/matches-state.js";
import type { Unmatches } from "./unmatches.js";

export type BuildOutput = Array<BuildOutput> | string | boolean;

export function build(unmatches: Unmatches, matches: Matches): BuildOutput {
  function walk(unmatches: Unmatches) {
    switch (unmatches.type) {
      case "string":
      case "boolean":
      case "array": {
        return matches.getByType(unmatches.ref, unmatches.type);
      }

      case "strict_tuple": {
        const tuple: BuildOutput = [];

        for (const unmatch of unmatches.items) {
          const match = walk(unmatch);
          tuple.push(match);
        }

        return tuple;
      }

      default: {
        throw new Error();
      }
    }
  }

  return walk(unmatches);
}
