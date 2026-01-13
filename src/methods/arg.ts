import * as v from "valibot"
import { ArgMetadata } from "./arg-metadata"

export const INTERNAL = Symbol("INTERNAL")
export type INTERNAL = typeof INTERNAL

export type ArgMethod<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  T extends ArgMetadata
> = v.SchemaWithPipe<
  readonly [
    TSchema,
    v.MetadataAction<v.InferOutput<TSchema>, { [INTERNAL]: T }>
  ]
>

export function arg<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  TArgMetadata extends ArgMetadata
>(schema: TSchema, internal: TArgMetadata) {
  return v.pipe(schema, v.metadata({ [INTERNAL]: internal }))
}

export function isArgMethod<
  T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
>(
  schema: T
): schema is T &
  ArgMethod<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>, ArgMetadata> {
  return (
    "pipe" in schema &&
    Array.isArray(schema.pipe) &&
    schema.pipe.length === 1 &&
    schema.pipe[1]?.kind === "metadata" &&
    schema.pipe[1]?.type === "metadata" &&
    typeof schema.pipe[1]?.metadata === "object" &&
    INTERNAL in schema.pipe[1]?.metadata
  )
}

export function getArgMethodMetadata<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  TArgMetadata extends ArgMetadata
>(schema: ArgMethod<TSchema, TArgMetadata>): TArgMetadata {
  return schema.pipe[1].metadata[INTERNAL]
}
