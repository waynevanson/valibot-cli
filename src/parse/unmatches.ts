import {
  type ArgOptionMetadata,
  type ArgValueMetadata,
  getArgMethodMetadata,
} from "../methods/index.js";
import type { MaybeReadonly } from "../utils/index.js";
import type { ParsableSchema } from "./parse.js";

export type UnmatchString = {
  ref: symbol;
  type: "string";
  metadata: ArgValueMetadata | ArgOptionMetadata;
  value: "optional" | "required";
};

export type UnmatchBoolean = {
  ref: symbol;
  type: "boolean";
  metadata: ArgOptionMetadata;
  value: "required" | "optional";
};

export type UnmatchStrictTuple = {
  ref: symbol;
  items: MaybeReadonly<Array<Unmatch>>;
  type: "strict_tuple";
};

export type UnmatchArray = {
  ref: symbol;
  item: UnmatchArrayItem;
  type: "array";
  metadata: ArgOptionMetadata;
};

export type UnmatchArrayItem = { type: "string" } | { type: "boolean" };

export type UunmatchBranch = UnmatchStrictTuple;
export type UnmatchLeaf = UnmatchString | UnmatchBoolean | UnmatchArray;

export type Unmatch = UunmatchBranch | UnmatchLeaf;

// todo: constrain input to valid types
export class Unmatches<Schema extends ParsableSchema = ParsableSchema> {
  readonly value: Unmatch;

  constructor(schema: Schema) {
    this.value = construct(schema);
  }

  find(predicate: (leaf: UnmatchLeaf) => boolean): UnmatchLeaf {
    const value = find(this.value, predicate);

    if (value === undefined) {
      throw new Error();
    }

    return value;
  }
}

function construct(schema: ParsableSchema): Unmatch {
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
      const items = schema.items.map((item) => construct(item as never));
      return { type: schema.type, ref, items };
    }

    case "array": {
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

function find(
  unmatches: Unmatch,
  predicate: (leaf: UnmatchLeaf) => boolean,
): UnmatchLeaf | undefined {
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
        const unmatch = find(item, predicate);

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
