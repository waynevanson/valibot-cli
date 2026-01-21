import type * as v from "valibot";
import type { ArgSubcommandMetadata } from "./arg-metadata.js";
import { arg } from "./arg-method.js";

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
        // biome-ignore lint/suspicious/noExplicitAny: From underneath
        ...v.PipeItem<any, unknown, v.BaseIssue<unknown>>[],
      ]
    >;

// todo: use variants or ensure a singleone
export function subcommand<TSchema extends Subcommand>(
  schema: TSchema,
  subcommand: Omit<ArgSubcommandMetadata, "type">,
) {
  return arg(schema, { type: "subcommand", ...subcommand });
}
