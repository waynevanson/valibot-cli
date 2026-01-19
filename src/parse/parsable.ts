import * as v from "valibot"
import { ArgMethod, ArgValueMetadata, ArgOptionMetadata } from "../methods"

export type ParsableSchemaString = ArgMethod<
  v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
  ArgValueMetadata | ArgOptionMetadata
>

export interface ParsableSchemaStrictTuple<
  TupleItems extends v.TupleItems
> extends v.StrictTupleSchema<
  TupleItems,
  v.ErrorMessage<v.StrictTupleIssue> | undefined
> {}

export type ParsableSchemaPrimitive = ParsableSchemaString

export type ParsableSchema<TupleItems extends v.TupleItems> =
  | ParsableSchemaString
  | ParsableSchemaStrictTuple<TupleItems>
