import type * as v from "valibot";
import type { MaybeReadonly } from "../utils/index.js";
import type { ArgValueMetadata } from "./arg-metadata.js";
import { type ArgMetadataSchema, arg } from "./arg-method.js";

export type ValueLeafSchema =
  | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
  | v.NumberSchema<v.ErrorMessage<v.NumberIssue> | undefined>;

export type ValueBranchSchema<Schema extends v.GenericSchema> =
  | v.ArraySchema<Schema, v.ErrorMessage<v.ArrayIssue> | undefined>
  | v.StrictTupleSchema<
      MaybeReadonly<Array<Schema>>,
      v.ErrorMessage<v.StrictTupleIssue> | undefined
    >;

export type ValueSchema = ValueBranchSchema<ValueLeafSchema> | ValueLeafSchema;

export type ArgMetadataValueSchema<Schema extends ValueSchema> =
  ArgMetadataSchema<Schema, ArgValueMetadata>;

export function value<TSchema extends ValueSchema>(
  schema: TSchema,
  value: Omit<ArgValueMetadata, "type">,
): ArgMetadataValueSchema<TSchema> {
  return arg(schema, { type: "value", ...value });
}
