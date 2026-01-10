import type {
  BaseIssue,
  BaseSchema,
  MetadataAction,
  PipeItem,
  SchemaWithPipe,
} from "valibot"

export type ArgMetadata =
  | {
      type: "value"
      name: string
      aliases: Array<string>
    }
  | { type: "flag" }
  | { type: "command" }
  | { type: "subcommand" }

export type Parsable = LeafSchema

export type TreeSchema = {}

// well these are for args.
export type LeafSchema = SchemaWithPipe<
  readonly [
    BaseSchema<string, unknown, BaseIssue<unknown>>,
    ...(
      | PipeItem<any, unknown, BaseIssue<unknown>>
      | MetadataAction<unknown, ArgMetadata>
    )[],
  ]
>
