import * as v from "valibot"
import {
  ArgOptionMetadata,
  ArgValueMetadata,
  getArgMethodMetadata
} from "../methods"
import { MaybeReadonly } from "../utils"
import { ParsableSchema } from "./parsable"

export type UnmatchesNodeString = {
  id: symbol
  type: "string"
  metadata: ArgValueMetadata | ArgOptionMetadata
}

export type UnmatchesNodeStructTuple = {
  id: symbol
  items: MaybeReadonly<Array<Unmatches>>
  type: "strict_tuple"
}

export type Unmatches = UnmatchesNodeString | UnmatchesNodeStructTuple

export function createUnmatches<
  Schema extends ParsableSchema<
    MaybeReadonly<Array<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>>
  >
>(schema: Schema): Unmatches {
  function walk(
    schema: ParsableSchema<
      MaybeReadonly<Array<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>>
    >
  ): Unmatches {
    switch (schema.type) {
      case "string": {
        const metadata = getArgMethodMetadata(schema)
        return { type: schema.type, id: Symbol(), metadata }
      }

      case "strict_tuple": {
        const items = schema.items.map((item) => walk(item))

        return { type: schema.type, id: Symbol(), items }
      }
    }
  }

  return walk(schema)
}
