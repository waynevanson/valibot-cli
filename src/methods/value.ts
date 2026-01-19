import * as v from "valibot"
import { ArgValueMetadata } from "./arg-metadata.js"
import { arg } from "./arg-method.js"
import type { MaybeReadonly } from "../utils/index.js"

export type ValueSchema =
  | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
  | v.NumberSchema<v.ErrorMessage<v.NumberIssue> | undefined>
  | v.ArraySchema<
      | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
      | v.NumberSchema<v.ErrorMessage<v.NumberIssue> | undefined>,
      v.ErrorMessage<v.ArrayIssue> | undefined
    >
  | v.StrictTupleSchema<
      MaybeReadonly<
        Array<
          | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
          | v.NumberSchema<v.ErrorMessage<v.NumberIssue> | undefined>
        >
      >,
      v.ErrorMessage<v.StrictTupleIssue> | undefined
    >

export function value<TSchema extends ValueSchema>(
  schema: TSchema,
  value: Omit<ArgValueMetadata, "type">
) {
  return arg(schema, { type: "value", ...value })
}
