import * as v from "valibot"
import { ArgMethod, ArgOptionMetadata, ArgValueMetadata } from "../methods"
import { createArgsTokens } from "./arg-token"
import { createMatches } from "./matches"
import { build } from "./build"

// at the start we allow all args
// but we eventually it gets narrowed down

export type ParsablePrimitiveSchema =
  | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
  | v.NumberSchema<v.ErrorMessage<v.NumberIssue> | undefined>

export type ParsableContainerSchema = v.ArraySchema<
  ParsablePrimitiveSchema,
  v.ErrorMessage<v.ArrayIssue> | undefined
>

export type ParsableSchema =
  | ArgMethod<
      ParsablePrimitiveSchema | ParsableContainerSchema,
      ArgOptionMetadata
    >
  | ArgMethod<
      v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
      ArgValueMetadata
    >
  | v.StrictTupleSchema<
      | Array<ArgMethod<ParsablePrimitiveSchema, ArgOptionMetadata>>
      | ReadonlyArray<ArgMethod<ParsablePrimitiveSchema, ArgOptionMetadata>>,
      v.ErrorMessage<v.StrictTupleIssue> | undefined
    >

export function parse<TSchema extends ParsableSchema>(
  schema: TSchema,
  args: Array<string>
): v.InferInput<TSchema> {
  const tokens = createArgsTokens(args)
  const matches = createMatches(schema, tokens)
  const input = build(schema, matches)
  return input
}
