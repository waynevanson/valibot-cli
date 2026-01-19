import * as v from "valibot"
import {
  ArgMethod,
  ArgOptionMetadata,
  ArgValueMetadata
} from "../methods/index.js"
import { createArgsTokens } from "./arg-token.js"
import { build } from "./build.js"
import { createMatches } from "./matches.js"
import { createUnmatches } from "./unmatches.js"
import { MaybeReadonly } from "../utils/index.js"

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
  args: ReadonlyArray<string>
): v.InferInput<TSchema> {
  const unmatches = createUnmatches(schema)
  const tokens = createArgsTokens(args)
  const matches = createMatches(unmatches, tokens)
  const input = build(unmatches, matches)
  return input as never
}
