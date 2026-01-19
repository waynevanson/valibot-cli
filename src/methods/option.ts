import * as v from "valibot"
import { ArgOptionMetadata } from "./arg-metadata"
import { arg } from "./arg-method"

export type OptionSchema = v.StringSchema<
  v.ErrorMessage<v.StringIssue> | undefined
>

export function option<const TSchema extends OptionSchema>(
  schema: TSchema,
  option: Omit<ArgOptionMetadata, "type">
) {
  return arg(schema, { type: "option", ...option })
}
