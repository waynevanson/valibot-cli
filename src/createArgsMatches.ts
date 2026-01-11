import {
  ArrayIssue,
  ArraySchema,
  BaseIssue,
  BaseSchema,
  BaseValidation,
  ErrorMessage,
  ExactOptionalSchema,
  LooseObjectIssue,
  LooseObjectSchema,
  ObjectEntries,
  ObjectIssue,
  ObjectSchema,
  PipeItem,
  SchemaWithPipe,
  StrictObjectIssue,
  StrictObjectSchema
} from "valibot"
import * as v from "valibot"
import { INTERNAL } from "./actions"
import { ArgCommand, ArgKind, FindExactlyOne } from "./types"
import { behead } from "./utils"

export interface ArgsMatches {
  args: {
    valid: Array<string>
    // can't figure out why clap did this with 2 vecs of same size rather than 1
    all: Array<readonly [string, ArgKind]>
  }
  subcommand: null | Subcommand
}

export interface Subcommand {
  name: string
  matches: ArgsMatches
}

export type CommandableSchemaKind = v.SchemaWithPipe<
  readonly [v.StringSchema<v.ErrorMessage<v.StringIssue>>]
>

export type Container =
  | ArraySchema<
      BaseSchema<unknown, unknown, BaseIssue<unknown>>,
      ErrorMessage<ArrayIssue> | undefined
    >
  | LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined>
  | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>
  | StrictObjectSchema<
      ObjectEntries,
      ErrorMessage<StrictObjectIssue> | undefined
    >
  | SchemaWithPipe<
      [
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        ...PipeItem<unknown, unknown, v.BaseIssue<unknown>>[]
      ]
    >

// arg groups are structures with all leaf values
// let's build a structure that can use the schema to check what can be matched.
// Otherwise we'll have to traverse this thing every time.

// top level should be a command
// containing variants for subcommands
// command/subcommand leafs of inputs should be args
export function createArgsMatches<const TSchema extends CommandableSchemaKind>(
  schema: TSchema
) {
  let args: Array<string> = []

  // check if top is leaf: value or flag

  switch (schema.type) {
    case "string": {
      break
    }
  }

  return {
    args
  }
}
