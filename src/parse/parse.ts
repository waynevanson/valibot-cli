import * as v from "valibot"
import { ArgMethod, ArgOptionMetadata, ArgValueMetadata } from "../methods"
import { createArgsTokens } from "./arg-token"
import { build } from "./build"
import { createMatches } from "./matches"
import { createUnmatches } from "./unmatches"
import { MaybeReadonly } from "../utils"

// at the start we allow all args
// but we eventually it gets narrowed down

export type ParsableSchema =
  | ArgMethod<
      v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
      ArgOptionMetadata | ArgValueMetadata
    >
  | v.StrictTupleSchema<
      MaybeReadonly<
        Array<
          ArgMethod<
            v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
            ArgOptionMetadata | ArgValueMetadata
          >
        >
      >,
      v.ErrorMessage<v.StrictTupleIssue> | undefined
    >

export function parse<TSchema extends ParsableSchema>(
  schema: TSchema,
  args: Array<string>
): v.InferInput<TSchema> {
  const unmatches = createUnmatches(schema)
  const tokens = createArgsTokens(args)
  const matches = createMatches(unmatches, tokens)
  const input = build(unmatches, matches)
  return input
}
