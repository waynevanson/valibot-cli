import * as v from "valibot";
import { arg } from "./arg-method.js";

export type OptionSchema =
  | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
  | v.BooleanSchema<v.ErrorMessage<v.BooleanIssue> | undefined>
  | v.ArraySchema<
      | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
      | v.BooleanSchema<v.ErrorMessage<v.BooleanIssue> | undefined>,
      v.ErrorMessage<v.ArrayIssue> | undefined
    >
  | v.ExactOptionalSchema<
      v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
      string | undefined
    >
  | v.OptionalSchema<
      v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
      string | undefined
    >
  | v.NullableSchema<
      v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
      string | null | undefined
    >;

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

const OptionOptions = v.intersect([
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
