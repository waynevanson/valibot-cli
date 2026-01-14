import * as v from "valibot"
import { ArgValueMetadata } from "./arg-metadata"
import { arg } from "./arg"

export type ValueSchema =
  | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
  | v.NumberSchema<v.ErrorMessage<v.NumberIssue> | undefined>
  | v.ArraySchema<
      | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
      | v.NumberSchema<v.ErrorMessage<v.NumberIssue> | undefined>,
      v.ErrorMessage<v.ArrayIssue> | undefined
    >

export function value<TSchema extends ValueSchema>(
  schema: TSchema,
  value: Omit<ArgValueMetadata, "type">
) {
  return arg(schema, { type: "value", ...value })
}
