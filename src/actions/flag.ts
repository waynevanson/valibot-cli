import * as v from "valibot"
import { ArgFlag } from "../types"
import { arg } from "./arg"

export type FlagSchema =
  | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
  | v.BlobSchema<v.ErrorMessage<v.BlobIssue> | undefined>
  | v.BigintSchema<v.ErrorMessage<v.BigintIssue> | undefined>
  | v.CustomSchema<string, v.ErrorMessage<v.CustomIssue> | undefined>
  | v.DateSchema<v.ErrorMessage<v.DateIssue> | undefined>
  | v.EnumSchema<v.Enum, v.ErrorMessage<v.EnumIssue> | undefined>
  | v.ExactOptionalSchema<
      v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
      v.Default<
        v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
        null | undefined
      >
    >
  | v.NumberSchema<v.ErrorMessage<v.NumberIssue> | undefined>

export function flag<TSchema extends FlagSchema>(
  schema: TSchema,
  flag: ArgFlag
) {
  return arg(schema, flag)
}
