import * as v from "valibot";
import type { ArgMetadata } from "./arg-metadata.js";

export const ARG_METADATA = Symbol("ARG_METADATA");
export type ARG_METADATA = typeof ARG_METADATA;

export type ArgMetadataSchema<
  TSchema extends v.GenericSchema,
  T extends ArgMetadata,
> = v.SchemaWithPipe<
  readonly [
    TSchema,
    v.MetadataAction<v.InferOutput<TSchema>, { [ARG_METADATA]: T }>,
  ]
>;

export function arg<
  TSchema extends v.GenericSchema,
  TArgMetadata extends ArgMetadata,
>(
  schema: TSchema,
  internal: TArgMetadata,
): ArgMetadataSchema<TSchema, TArgMetadata> {
  return v.pipe(schema, v.metadata({ [ARG_METADATA]: internal }));
}

export function isArgMetadataSchema<T extends v.GenericSchema>(
  schema: T,
): schema is T & ArgMetadataSchema<v.GenericSchema, ArgMetadata> {
  return (
    "pipe" in schema &&
    Array.isArray(schema.pipe) &&
    schema.pipe.length === 2 &&
    schema.pipe[1]?.kind === "metadata" &&
    schema.pipe[1]?.type === "metadata" &&
    typeof schema.pipe[1]?.metadata === "object" &&
    ARG_METADATA in schema.pipe[1].metadata
  );
}
