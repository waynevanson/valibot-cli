import * as v from "valibot"
import {
  ArgFlagMetadata,
  ArgMetadata,
  ArgSubcommandMetadata,
  ArgValueMetadata,
  isArgFlagMetadata,
  isArgSubcommandMetadata
} from "./methods"
import { ArgMethod, getArgMethodMetadata, isArgMethod } from "./methods/arg"

export interface ArgMatches {
  args: {
    valid: Array<string>
    // can't figure out why clap did this with 2 vecs of same size rather than 1
    all: Array<readonly [string, ArgMetadata]>
  }
  subcommand: null | Subcommand
}

export interface Subcommand {
  name: string
  matches: ArgMatches
}

export interface ArgMatchBase {
  schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
  id: symbol
}

export type ArgMatch = ArgFlagMatch | ArgValueMatch | ArgFlagValueMatch

export type ArgFlagValueMatch = ArgMatchBase &
  Omit<ArgFlagMetadata, "type"> & {
    type: "flag-with-value"
    optional: boolean
    omittable: boolean
    default?: unknown
  }

export type ArgFlagMatch = ArgMatchBase &
  ArgFlagMetadata & {
    schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    optional: boolean
    default?: unknown
  }

export type ArgValueMatch = ArgMatchBase &
  ArgValueMetadata & {
    schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    optional: boolean
    default?: unknown
  }

export type ArgSubcommandMatch = ArgMatchBase &
  ArgSubcommandMetadata & {
    schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    optional: boolean
  }

export type CommandableSchemaKind =
  | ArgMethod<
      | v.StringSchema<v.ErrorMessage<v.StringIssue>>
      | v.NumberSchema<v.ErrorMessage<v.NumberIssue>>,
      ArgValueMetadata | ArgFlagMetadata
    >
  | v.StrictObjectSchema<v.ObjectEntries, v.ErrorMessage<v.StrictObjectIssue>>
  | v.VariantSchema<
      string,
      v.VariantOptions<string>,
      v.ErrorMessage<v.VariantIssue>
    >

// arg groups are structures with all leaf values
// let's build a structure that can use the schema to check what can be matched.
// Otherwise we'll have to traverse this thing every time.

// top level should be a command
// containing variants for subcommands
// command/subcommand leafs of inputs should be args
export function createArgMatches<const TSchema extends CommandableSchemaKind>(
  schema: TSchema
) {
  const matches: Array<ArgMatch> = []

  switch (schema.type) {
    case "string":
    case "number":
      const argMetadata = getArgMethodMetadata(schema)

      matches.push({ ...argMetadata, optional: false, schema, id: Symbol() })
      break

    case "strict_object": {
      for (const property in schema.entries) {
        const entry = schema.entries[property]

        switch (entry.type) {
          // user needs to provide this value as flag, since positional can't be provided and omit a value at the same time.
          case "exact_optional":
            if (isArgMethod(entry)) {
              const argMetadata = getArgMethodMetadata(entry)

              if (!isArgFlagMetadata(argMetadata)) {
                throw new Error("Expected not to be a subcommand")
              }

              matches.push({
                ...argMetadata,
                type: "flag-with-value",
                omittable: true,
                optional: false,
                schema: entry,
                id: Symbol()
              })
            }

          case "optional":
          case "null":
            if (isArgMethod(entry)) {
              const argMetadata = getArgMethodMetadata(entry)

              if (isArgSubcommandMetadata(argMetadata)) {
                throw new Error("Expected not to be a subcommand")
              }

              matches.push({
                ...argMetadata,
                optional: true,
                default: v.getDefault(entry),
                schema: entry,
                id: Symbol()
              })
            }
        }
      }
      break
    }

    case "variant":
      for (const option of schema.options) {
      }
      break

    default:
      let _: never = schema
  }

  return matches
}
