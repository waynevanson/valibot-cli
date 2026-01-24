import type * as v from "valibot";
import * as c from "../index.js";
import { isArgMethod } from "../methods/arg-method.js";
import type { ParsableSchema } from "../parse/parse.js";

export interface Fixture<Schema extends ParsableSchema> {
  schema: Schema;
  cases: ReadonlyArray<{
    expected: v.InferInput<Schema>;
    argvs: ReadonlyArray<ReadonlyArray<string>>;
  }>;
}

export function createFixtures<Schemas extends ReadonlyArray<ParsableSchema>>(
  fixtures: {
    [P in keyof Schemas]: Fixture<Schemas[P]>;
  },
) {
  return fixtures;
}

/**
 * @summary
 * Stringify the Object to a single line string.
 */
export function stringify(value: unknown): string {
  switch (typeof value) {
    case "object": {
      if (value === null) {
        return "null";
      }

      if (Array.isArray(value)) {
        return `[${value.map((v) => stringify(v)).join(", ")}]`;
      }

      let entries = "";
      entries += "{ ";

      for (const name in value) {
        entries += name;
        entries += ": ";
        //@ts-expect-error
        entries += stringify(value[name]);
        entries += ", ";
      }

      entries += "}";

      return entries;
    }

    case "boolean":
    case "number": {
      return value.toString();
    }

    case "string": {
      return `"${value}"`;
    }

    case "undefined": {
      return "undefined";
    }

    default: {
      throw new Error();
    }
  }
}

export function createFixtureName<Schema extends ParsableSchema>(
  schema: Schema,
): string {
  if (isArgMethod(schema)) {
    const metadata = c.getArgMethodMetadata(schema);

    const type = metadata.type;
    //@ts-expect-error
    delete metadata.type;

    const name = createFixtureName(schema.pipe[0] as never);

    return `${type}(${name}, ${stringify(metadata)})`;
  }

  switch (schema.type) {
    case "boolean":
    case "string":
      return schema.type;

    case "array": {
      return `${schema.type}(${createFixtureName(schema.item as never)})`;
    }

    case "strict_tuple": {
      return `${schema.type}([${schema.items.map((item) => createFixtureName(item)).join(", ")}])`;
    }

    case "nullable":
    case "optional":
    case "exact_optional": {
      const default_ =
        schema.default == null ? "" : `, ${stringify(schema.default)}`;
      return `${schema.type}(${createFixtureName(schema.wrapped as never)}${default_})`;
    }

    case "object":
    case "strict_object": {
      let entries = "";
      entries += "{ ";

      for (const name in schema.entries) {
        entries += name;
        entries += ": ";
        entries += createFixtureName(schema.entries[name]);
        entries += ", ";
      }

      entries += "}";

      return `${schema.type}(${entries})`;
    }

    default: {
      throw new Error();
    }
  }
}
