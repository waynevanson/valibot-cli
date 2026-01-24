import * as v from "valibot";
import type { ArgMetadata } from "./arg-metadata.js";
import type { OptionParsable, OptionSchema } from "./option.js";
import type { ValueParsable, ValueSchema } from "./value.js";

export const ARG_METADATA = Symbol("ARG_METADATA");
export type ARG_METADATA = typeof ARG_METADATA;

export type ArgMethod<
  TSchema extends v.GenericSchema,
  T extends ArgMetadata,
> = v.SchemaWithPipe<
  readonly [
    TSchema,
    v.MetadataAction<v.InferOutput<TSchema>, { [ARG_METADATA]: T }>,
  ]
>;

export type ArgSchema = ValueSchema | OptionSchema;

export type ArgParsable<Schema extends ValueSchema | OptionSchema> =
  Schema extends ValueSchema
    ? ValueParsable<Schema>
    : never | Schema extends OptionSchema
      ? OptionParsable<Schema>
      : never;

export function arg<
  TSchema extends v.GenericSchema,
  TArgMetadata extends ArgMetadata,
>(schema: TSchema, internal: TArgMetadata): ArgMethod<TSchema, TArgMetadata> {
  return v.pipe(schema, v.metadata({ [ARG_METADATA]: internal }));
}

export function isArgMethod<T extends v.GenericSchema>(
  schema: T,
): schema is T & ArgMethod<v.GenericSchema, ArgMetadata> {
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

export function getArgMethodMetadata<
  TSchema extends v.GenericSchema,
  TArgMetadata extends ArgMetadata,
>(schema: ArgMethod<TSchema, TArgMetadata>): TArgMetadata {
  return structuredClone(schema.pipe[1].metadata[ARG_METADATA]);
}
