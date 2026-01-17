import * as v from "valibot"
import { Matches } from "./matches"
import { ParsableSchema } from "./parse"
import { Unmatches } from "./unmatches"

export function build<TSchema extends ParsableSchema>(
  unmatches: Unmatches,
  matches: Matches
): v.InferInput<TSchema> {
  // so I need like the type information too..
  for (const unmatch of unmatches.args.value) {
    matches.set()
  }
}
