import * as v from "valibot"
import { ArgOptionMetadata } from "./arg-metadata"
import { arg } from "./arg-method"

export type OptionSchema =
  | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
  | v.NumberSchema<v.ErrorMessage<v.NumberIssue> | undefined>
  | v.ArraySchema<
      | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
      | v.NumberSchema<v.ErrorMessage<v.NumberIssue> | undefined>,
      v.ErrorMessage<v.ArrayIssue> | undefined
    >

export function option<const TSchema extends OptionSchema>(
  schema: TSchema,
  option: Omit<ArgOptionMetadata, "type">
) {
  return arg(schema, { type: "option", ...option })
}
