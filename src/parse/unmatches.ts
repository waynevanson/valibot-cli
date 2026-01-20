import * as v from "valibot"
import {
  ArgOptionMetadata,
  ArgValueMetadata,
  getArgMethodMetadata
} from "../methods/index.js"
import { MaybeReadonly } from "../utils/index.js"
import { ParsableSchema } from "./parse.js"

export type UnmatchesNodeString = {
  ref: symbol
  type: "string"
  metadata: ArgValueMetadata | ArgOptionMetadata
  value: "optional" | "required"
}

export type UnmatchesNodeBoolean = {
  ref: symbol
  type: "boolean"
  metadata: ArgOptionMetadata
  value: "required" | "optional"
}

export type UnmatchesNodeStructTuple = {
  ref: symbol
  items: MaybeReadonly<Array<Unmatches>>
  type: "strict_tuple"
}

export type Unmatches =
  | UnmatchesNodeString
  | UnmatchesNodeStructTuple
  | UnmatchesNodeBoolean

export function createUnmatches<Schema extends ParsableSchema>(
  schema: Schema
): Unmatches {
  function walk(schema: ParsableSchema): Unmatches {
    switch (schema.type) {
      case "string": {
        const metadata = getArgMethodMetadata(schema)
        return { type: schema.type, ref: Symbol(), value: "required", metadata }
      }

      case "boolean": {
        const metadata = getArgMethodMetadata(schema)
        return { type: schema.type, ref: Symbol(), value: "required", metadata }
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
