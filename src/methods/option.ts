import * as v from "valibot";
import type { ArgOptionMetadata } from "./arg-metadata.js";
import { type ArgMethod, arg } from "./arg-method.js";

export type OptionValueSchema =
  | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
  | v.BooleanSchema<v.ErrorMessage<v.BooleanIssue> | undefined>;

// todo: nullish
export type OptionBoxSchema<Schema extends OptionValueSchema> =
  | v.ArraySchema<Schema, v.ErrorMessage<v.ArrayIssue> | undefined>
  | v.ExactOptionalSchema<Schema, v.Default<Schema, never>>
  | v.OptionalSchema<Schema, v.Default<Schema, never>>
  | v.NullableSchema<Schema, v.Default<Schema, never>>;

export type OptionSchema =
  | OptionValueSchema
  | OptionBoxSchema<OptionValueSchema>;

export type OptionParsable<Schema extends OptionSchema = OptionSchema> =
  ArgMethod<Schema, ArgOptionMetadata>;

const long = v.pipe(v.string(), v.regex(/^\w+(-\w+)*$/));
const short = v.pipe(v.string(), v.regex(/^\w$/));

const shorts = v.object({
  shorts: v.tupleWithRest([short], short),
  longs: v.optional(v.array(long), []),
});

const longs = v.object({
  shorts: v.optional(v.array(short), []),
  longs: v.tupleWithRest([long], long),
});

export const OptionOptions = v.intersect([
  v.object({ name: v.pipe(v.string(), v.minLength(1)) }),
  v.union([longs, shorts]),
]);

export type OptionOptions = v.InferInput<typeof OptionOptions>;

export function option<const TSchema extends OptionSchema>(
  schema: TSchema,
  options: OptionOptions,
) {
  const parsed = v.parse(OptionOptions, options);
  return arg(schema, { type: "option", ...parsed });
}
