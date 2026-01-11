import * as v from "valibot"
import { ArgSubcommand } from "../types"
import { arg } from "./arg"

export type Subcommand =
  | v.ArraySchema<
      v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
      v.ErrorMessage<v.ArrayIssue> | undefined
    >
  | v.LooseObjectSchema<
      v.ObjectEntries,
      v.ErrorMessage<v.LooseObjectIssue> | undefined
    >
  | v.LooseTupleSchema<
      v.TupleItems,
      v.ErrorMessage<v.LooseTupleIssue> | undefined
    >
  | v.ObjectSchema<v.ObjectEntries, v.ErrorMessage<v.ObjectIssue> | undefined>
  | v.StrictObjectSchema<
      v.ObjectEntries,
      v.ErrorMessage<v.StrictObjectIssue> | undefined
    >
  | v.StrictTupleSchema<
      v.TupleItems,
      v.ErrorMessage<v.StrictTupleIssue> | undefined
    >
  | v.TupleSchema<v.TupleItems, v.ErrorMessage<v.TupleIssue> | undefined>
  | v.SchemaWithPipe<
      readonly [
        v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
        ...v.PipeItem<any, unknown, v.BaseIssue<unknown>>[]
      ]
    >

// todo: use variants or ensure a singleone
export function subcommand<TSchema extends Subcommand>(
  schema: TSchema,
  subcommand: ArgSubcommand
) {
  return arg(schema, subcommand)
}
