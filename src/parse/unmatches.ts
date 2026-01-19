import * as v from "valibot"
import {
  ArgOptionMetadata,
  ArgValueMetadata,
  getArgMethodMetadata
} from "../methods/index.js"
import { MaybeReadonly } from "../utils/index.js"
import { ParsableSchema } from "./parsable.js"

export type UnmatchesNodeString = {
  ref: symbol
  type: "string"
  metadata: ArgValueMetadata | ArgOptionMetadata
}

export type UnmatchesNodeStructTuple = {
  ref: symbol
  items: MaybeReadonly<Array<Unmatches>>
  type: "strict_tuple"
}

export type Unmatches = UnmatchesNodeString | UnmatchesNodeStructTuple

export function createUnmatches<
  Schema extends ParsableSchema<MaybeReadonly<Array<v.GenericSchema>>>
>(schema: Schema): Unmatches {
  function walk(
    schema: ParsableSchema<MaybeReadonly<Array<v.GenericSchema>>>
  ): Unmatches {
    switch (schema.type) {
      case "string": {
        const metadata = getArgMethodMetadata(schema)
        return { type: schema.type, ref: Symbol(), metadata }
      }

      case "strict_tuple": {
        const items = schema.items.map((item) => walk(item as never))
        return { type: schema.type, ref: Symbol(), items }
      }

      default: {
        throw new Error()
      }
    }
  }

  return walk(schema)
}
