import * as v from "valibot"
import {
  ArgMethod,
  ArgValueMetadata,
  ArgOptionMetadata
} from "../methods/index.js"

export type ParsableSchemaString = ArgMethod<
  v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
  ArgValueMetadata | ArgOptionMetadata
>

export type ParsableSchemaBoolean = ArgMethod<
  v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
  ArgValueMetadata | ArgOptionMetadata
>

export interface ParsableSchemaStrictTuple<
  TupleItems extends v.TupleItems
> extends v.StrictTupleSchema<
  TupleItems,
  v.ErrorMessage<v.StrictTupleIssue> | undefined
> {}

export type ParsableSchemaPrimitive =
  | ParsableSchemaString
  | ParsableSchemaBoolean

export type ParsableSchema<TupleItems extends v.TupleItems> =
  | ParsableSchemaPrimitive
  | ParsableSchemaStrictTuple<TupleItems>
