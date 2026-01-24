import type * as v from "valibot";
import type {
  ArgMethod,
  ArgOptionMetadata,
  ArgParsable,
  ArgSchema,
  ArgValueMetadata,
} from "../methods/index.js";
import type { MaybeReadonly } from "../utils/index.js";
import { build } from "./build.js";
import { Matches } from "./matches/index.js";
import { collectMatches } from "./matches/matches.js";
import { ArgsTokens } from "./tokens/args.js";
import { Unmatches } from "./unmatches.js";

export type ParsableLeaf<Schema extends ArgSchema> = ArgParsable<Schema>;

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
      ArgOptionMetadata | ArgValueMetadata
    >
  | ArgMethod<
      v.OptionalSchema<
        v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
        string | undefined
      >,
      ArgOptionMetadata
    >
  | ArgMethod<
      v.ExactOptionalSchema<
        v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
        string | undefined
      >,
      ArgOptionMetadata
    >
  | ArgMethod<
      v.NullableSchema<
        v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
        string | undefined
      >,
      ArgOptionMetadata
    >
  | v.ObjectSchema<
      Record<string, ParsableSchemaPrimitive>,
      v.ErrorMessage<v.ObjectIssue> | undefined
    >
  | v.StrictObjectSchema<
      Record<string, ParsableSchemaPrimitive>,
      v.ErrorMessage<v.StrictObjectIssue> | undefined
    >;

export function parse<TSchema extends ParsableSchema>(
  schema: TSchema,
  args: ReadonlyArray<string>,
): v.InferInput<TSchema> {
  const unmatches = new Unmatches(schema);
  const tokens = new ArgsTokens(args);

  const matches = new Matches();
  collectMatches(matches, unmatches, tokens);

  const input = build(unmatches, matches);
  return input as never;
}
