import { Matches } from "./matches/matches-state.js"
import { Unmatches } from "./unmatches.js"

export type BuildOutput = Array<BuildOutput> | string | boolean

export function build(unmatches: Unmatches, matches: Matches): BuildOutput {
  function walk(unmatches: Unmatches) {
    switch (unmatches.type) {
      case "string": {
        const match = matches.get(unmatches.ref)

        if (match === undefined) {
          throw new Error()
        }

        if (match.value.type !== "string") {
          throw new Error()
        }

        return match.value.value
      }

      case "boolean": {
        const match = matches.get(unmatches.ref)

        if (match === undefined) {
          throw new Error()
        }

        if (match.value.type !== "boolean") {
          throw new Error()
        }

        return match.value.value ?? false
      }

      case "strict_tuple": {
        const tuple: BuildOutput = []

        for (const unmatch of unmatches.items) {
          const match = walk(unmatch)

          tuple.push(match)
        }

        return tuple
      }

      default: {
        throw new Error()
      }
    }
  }

  return walk(unmatches)
}
