import * as v from "valibot"
import { ArgMetadata } from "./arg-metadata"

export const ARG_METADATA = Symbol("ARG_METADATA")
export type ARG_METADATA = typeof ARG_METADATA

export type ArgMethod<
  TSchema extends v.GenericSchema,
  T extends ArgMetadata
> = v.SchemaWithPipe<
  readonly [
    TSchema,
    v.MetadataAction<v.InferOutput<TSchema>, { [ARG_METADATA]: T }>
  ]
>

export function arg<
  TSchema extends v.GenericSchema,
  TArgMetadata extends ArgMetadata
>(schema: TSchema, internal: TArgMetadata): ArgMethod<TSchema, TArgMetadata> {
  return v.pipe(schema, v.metadata({ [ARG_METADATA]: internal }))
}

export function isArgMethod<T extends v.GenericSchema>(
  schema: T
): schema is T & ArgMethod<v.GenericSchema, ArgMetadata> {
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
  TSchema extends v.GenericSchema,
  TArgMetadata extends ArgMetadata
>(schema: ArgMethod<TSchema, TArgMetadata>): TArgMetadata {
  return schema.pipe[1].metadata[ARG_METADATA]
}
