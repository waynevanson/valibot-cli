import * as v from "valibot"

export function objectWithoutUndefined<
  const TEntries$1 extends v.ObjectEntries
>(entries: TEntries$1) {
  return objectWithoutRest(entries, v.undefined())
}

export function objectWithoutRest<
  const TEntries$1 extends v.ObjectEntries,
  const TRest$1 extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
>(entries: TEntries$1, rest: TRest$1) {
  return v.pipe(v.objectWithRest(entries, rest), v.object(entries))
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
