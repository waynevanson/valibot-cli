import type * as v from "valibot";
import type {
  ArgMethod,
  ArgOptionMetadata,
  ArgValueMetadata,
} from "../methods/index.js";
import type { MaybeReadonly } from "../utils/index.js";
import { build } from "./build.js";
import { Matches } from "./matches/index.js";
import { createArgsTokens } from "./tokens/args.js";
import { Unmatches } from "./unmatches.js";

export type ParsableSchemaPrimitive =
  | ArgMethod<
      v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
      ArgOptionMetadata | ArgValueMetadata
    >
  | ArgMethod<
      v.BooleanSchema<v.ErrorMessage<v.BooleanIssue> | undefined>,
      // todo: ArgValueMetadata
      ArgOptionMetadata
    >;

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
    >;

export function parse<TSchema extends ParsableSchema>(
  schema: TSchema,
  args: ReadonlyArray<string>,
): v.InferInput<TSchema> {
  const unmatches = new Unmatches(schema);
  const tokens = createArgsTokens(args);
  const matches = new Matches(unmatches, tokens);
  const input = build(unmatches, matches);
  return input as never;
}
