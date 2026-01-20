import * as v from "valibot"
import {
  ArgMethod,
  ArgOptionMetadata,
  ArgValueMetadata
} from "../methods/index.js"
import { createArgsTokens } from "./arg-token.js"
import { build } from "./build.js"
import { createMatches } from "./matches/index.js"
import { createUnmatches } from "./unmatches.js"
import { MaybeReadonly } from "../utils/index.js"

// at the start we allow all args
// but we eventually it gets narrowed down

export type ParsableSchemaPrimitive =
  | ArgMethod<
      v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
      ArgOptionMetadata | ArgValueMetadata
    >
  | ArgMethod<
      v.BooleanSchema<v.ErrorMessage<v.BooleanIssue> | undefined>,
      // todo: ArgValueMetadata
      ArgOptionMetadata
    >

export type ParsableSchema =
  | ParsableSchemaPrimitive
  | v.StrictTupleSchema<
      MaybeReadonly<Array<ParsableSchemaPrimitive>>,
      v.ErrorMessage<v.StrictTupleIssue> | undefined
    >
  | ArgMethod<
      v.ArraySchema<
        | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
        | v.BooleanSchema<v.ErrorMessage<v.BooleanIssue> | undefined>,
        v.ErrorMessage<v.ArrayIssue> | undefined
      >,
      // todo: ArgValueMetadata
      ArgOptionMetadata
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
