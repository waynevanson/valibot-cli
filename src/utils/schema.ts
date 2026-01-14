import * as v from "valibot"
import { filterObject } from "."

export function objectWithoutRestUndefined<
  const Entries extends v.ObjectEntries
>(entries: Entries) {
  return v.pipe(
    v.objectWithRest(entries, v.undefined()),
    v.transform(
      (
        input
      ): {
        [P in keyof Entries]: v.InferOutput<Entries[P]>
      } => filterObject(input) as never
    ),
    v.object(entries)
  )
}

export type UnPipe<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
> =
  TSchema extends v.SchemaWithPipe<
    readonly [
      infer T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
      ...any
    ]
  >
    ? UnPipe<T>
    : TSchema

export function unpipe<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
>(schema: TSchema): UnPipe<TSchema> {
  let schema_ = schema as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>

  while ("pipe" in schema_) {
    //@ts-expect-error
    schema_ = schema_.pipe[0]
  }

  //@ts-expect-error
  return schema_
}
