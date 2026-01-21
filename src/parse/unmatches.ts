import * as v from "valibot";
import {
  type ArgOptionMetadata,
  type ArgValueMetadata,
  getArgMethodMetadata,
} from "../methods/index.js";
import type { MaybeReadonly } from "../utils/index.js";
import type { ParsableSchema } from "./parse.js";

export type UnmatchesNodeString = {
  ref: symbol;
  type: "string";
  metadata: ArgValueMetadata | ArgOptionMetadata;
  value: "optional" | "required";
};

export type UnmatchesNodeBoolean = {
  ref: symbol;
  type: "boolean";
  metadata: ArgOptionMetadata;
  value: "required" | "optional";
};

export type UnmatchesNodeStructTuple = {
  ref: symbol;
  items: MaybeReadonly<Array<Unmatches>>;
  type: "strict_tuple";
};

export type UnmatchesNodeArray = {
  ref: symbol;
  item: UnmatchesNodeArrayItem;
  type: "array";
  metadata: ArgOptionMetadata;
};

export type UnmatchesNodeArrayItem = { type: "string" } | { type: "boolean" };

export type UnmatchesBranch = UnmatchesNodeStructTuple;
export type UnmatchesLeaf =
  | UnmatchesNodeString
  | UnmatchesNodeBoolean
  | UnmatchesNodeArray;

export type Unmatches = UnmatchesBranch | UnmatchesLeaf;

export function createUnmatches<Schema extends ParsableSchema>(
  schema: Schema,
): Unmatches {
  function walk(schema: ParsableSchema): Unmatches {
    const ref = Symbol();

    switch (schema.type) {
      case "string": {
        const metadata = getArgMethodMetadata(schema);
        return { type: schema.type, ref, value: "required", metadata };
      }

      case "boolean": {
        const metadata = getArgMethodMetadata(schema);
        return { type: schema.type, ref, value: "required", metadata };
      }

      case "strict_tuple": {
        const items = schema.items.map((item) => walk(item as never));
        return { type: schema.type, ref, items };
      }

      case "array": {
        // do I need to get the string?
        const metadata = getArgMethodMetadata(schema);
        return {
          type: "array",
          item: {
            type: schema.item.type,
          },
          ref,
          metadata,
        };
      }

      default: {
        throw new Error();
      }
    }
  }

  return walk(schema);
}

export function find(
  unmatches: Unmatches,
  predicate: (leaf: UnmatchesLeaf) => boolean,
): UnmatchesLeaf {
  function walk(unmatches: Unmatches): UnmatchesLeaf | undefined {
    switch (unmatches.type) {
      case "array":
      case "string":
      case "boolean": {
        if (predicate(unmatches)) {
          return unmatches;
        }

        break;
      }

      case "strict_tuple": {
        for (const item of unmatches.items) {
          const unmatch = walk(item);

          if (unmatch !== undefined) {
            return unmatch;
          }
        }

        break;
      }

      default: {
        throw new Error();
      }
    }

    return undefined;
  }

  const value = walk(unmatches);

  if (value === undefined) {
    throw new Error();
  }

  return value;
}
