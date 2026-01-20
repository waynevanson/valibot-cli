import * as v from "valibot"
import { arg } from "./arg-method.js"

export type OptionSchema =
  | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
  | v.BooleanSchema<v.ErrorMessage<v.BooleanIssue> | undefined>

// todo: kebab-case
const long = v.pipe(v.string())
const short = v.pipe(v.string(), v.minLength(1), v.maxLength(1))

const shorts = v.object({
  shorts: v.tupleWithRest([short], short),
  longs: v.optional(v.array(long), [])
})

const longs = v.object({
  shorts: v.optional(v.array(short), []),
  longs: v.tupleWithRest([long], long)
})

const OptionOptions = v.intersect([
  v.object({ name: v.pipe(v.string(), v.minLength(1)) }),
  v.union([longs, shorts])
])

export type OptionOptions = v.InferInput<typeof OptionOptions>

export function option<const TSchema extends OptionSchema>(
  schema: TSchema,
  options: OptionOptions
) {
  const parsed = v.parse(OptionOptions, options)
  return arg(schema, { type: "option", ...parsed })
}
