import { Matches } from "./matches"
import { Unmatches } from "./unmatches"

type BuildOutput = Array<BuildOutput> | string

export function build(unmatches: Unmatches, matches: Matches): BuildOutput {
  function walk(unmatches: Unmatches) {
    switch (unmatches.type) {
      case "string":
        const match = matches.get(unmatches.ref)

        if (match === undefined) {
          throw new Error()
        }

        return match.value.value

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
