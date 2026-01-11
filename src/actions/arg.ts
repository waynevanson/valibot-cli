import * as v from "valibot"
import { ArgKind } from "../types"

export const INTERNAL = Symbol("INTERNAL")
export type INTERNAL = typeof INTERNAL

export type ArgMethod<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  T extends ArgKind
> = v.SchemaWithPipe<
  readonly [TSchema, v.MetadataAction<string, { [INTERNAL]: T }>]
>

export function arg<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  TArgMetadata extends ArgKind
>(schema: TSchema, internal: TArgMetadata) {
  return v.pipe(schema, v.metadata({ [INTERNAL]: internal }))
}
