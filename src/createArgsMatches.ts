import * as v from "valibot"
import { ArgMethod, INTERNAL } from "./actions/arg"
import { ArgFlag, ArgKind, ArgValue } from "./types"

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

export type CommandableSchemaKind = ArgMethod<
  | v.StringSchema<v.ErrorMessage<v.StringIssue>>
  | v.NumberSchema<v.ErrorMessage<v.NumberIssue>>,
  ArgValue | ArgFlag
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
  const args: Array<ArgKind> = []

  switch (schema.type) {
    case "string":
    case "number":
      const kind = schema.pipe[1].metadata[INTERNAL]
      args.push(kind)
      break
  }

  return {
    // When we pull a value, we check that we can pull it.
    get(cfg: string) {
      const arg = args.find(
        (arg) => arg.type === "value" || arg.type === "flag"
      )

      switch (arg?.type) {
        case "value": {
          return cfg === arg.name || arg.aliases.includes(cfg) ? arg : undefined
        }
      }
    }
  }
}
