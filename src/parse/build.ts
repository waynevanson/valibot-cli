import * as v from "valibot"
import { Matches } from "./matches"
import { ParsableSchema } from "./parse"
import { Unmatches } from "./unmatches"

export function build<TSchema extends ParsableSchema>(
  unmatches: Unmatches,
  matches: Matches
): v.InferInput<TSchema> {
  switch (unmatches.type) {
    case "string":
      const match = matches.get(unmatches.ref)

      if (match === undefined) {
        throw new Error()
      }

      return match.value.value

    case "strict_tuple":
    default: {
      throw new Error()
    }
  }
}
