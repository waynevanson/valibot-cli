import * as v from "valibot"
import { ArgMetadata } from "./arg-metadata"
import * as s from "../utils/schemable"

export const ARG_METADATA = Symbol("ARG_METADATA")
export type ARG_METADATA = typeof ARG_METADATA

const ArgMethod = s.MetadataSchema(
  v.object({
    [ARG_METADATA]: v.string()
  })
)

export type ArgMethod<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  T extends ArgMetadata
> = v.SchemaWithPipe<
  readonly [
    TSchema,
    v.MetadataAction<v.InferOutput<TSchema>, { [ARG_METADATA]: T }>
  ]
>

export function arg<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  TArgMetadata extends ArgMetadata
>(schema: TSchema, internal: TArgMetadata): ArgMethod<TSchema, TArgMetadata> {
  return v.pipe(schema, v.metadata({ [ARG_METADATA]: internal }))
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
    ARG_METADATA in schema.pipe[1]?.metadata
  )
}

export function getArgMethodMetadata<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  TArgMetadata extends ArgMetadata
>(schema: ArgMethod<TSchema, TArgMetadata>): TArgMetadata {
  return schema.pipe[1].metadata[ARG_METADATA]
}
