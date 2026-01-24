import * as v from "valibot";
import { describe, expect, test } from "vitest";
import * as c from "../src/index.js";
import { isArgMethod } from "../src/methods/arg-method.js";
import type { ParsableSchema } from "../src/parse/index.js";

interface Fixture2<Schema extends ParsableSchema> {
  name: string;
  schema: Schema;
  cases: ReadonlyArray<{
    expected: v.InferInput<Schema>;
    argvs: ReadonlyArray<ReadonlyArray<string>>;
  }>;
}

function createFixtures<Schemas extends ReadonlyArray<ParsableSchema>>(
  fixtures: {
    [P in keyof Schemas]: Fixture2<Schemas[P]>;
  },
) {
  return fixtures;
}

function stringify(value: unknown): string {
  switch (typeof value) {
    case "object": {
      if (Array.isArray(value)) {
        return `[${value.map((v) => stringify(v)).join(", ")}]`;
      }

      if (value !== null) {
        let entries = "";
        entries += "{ ";

        for (const name in value) {
          if (name === "type") {
            continue;
          }

          entries += name;
          entries += ": ";
          //@ts-expect-error
          entries += stringify(value[name]);
          entries += ", ";
        }

        entries += "}";

        return entries;
      }

      return "null";
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

function createFixtureName<Schema extends ParsableSchema>(
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

const fixtures = createFixtures([
  {
    name: "option(string) long shorts aliases",
    schema: c.option(v.string(), {
      name: "greeting",

      longs: ["greeting", "quote"],
      shorts: ["g", "q"],
    }),
    cases: [
      {
        argvs: [["--greeting=hello"]],
        expected: "hello",
      },
      {
        argvs: [["--greeting", "hello"]],
        expected: "hello",
      },
      {
        argvs: [["--quote=hello"]],
        expected: "hello",
      },
      {
        argvs: [["--quote", "hello"]],
        expected: "hello",
      },
      {
        argvs: [["-q=hello"]],
        expected: "hello",
      },
      {
        argvs: [["-q", "hello"]],
        expected: "hello",
      },
    ],
  },
  {
    name: "option(string) long",
    schema: c.option(v.string(), {
      name: "greeting",
      longs: ["greeting"],
    }),
    cases: [
      {
        argvs: [["--greeting=hello"]],
        expected: "hello",
      },
      {
        argvs: [["--greeting", "hello"]],
        expected: "hello",
      },
    ],
  },
  {
    name: "option(string) short",
    schema: c.option(v.string(), {
      name: "greeting",
      shorts: ["g"],
    }),
    cases: [
      {
        argvs: [["-g=hello"]],
        expected: "hello",
      },
    ],
  },
  {
    name: "strict_tuple([option(string)]) long",
    schema: v.strictTuple([
      c.option(v.string(), {
        name: "greeting",
        longs: ["greeting"],
      }),
    ]),
    cases: [
      {
        argvs: [["--greeting=hello"]],
        expected: ["hello"],
      },
      {
        argvs: [["--greeting", "hello"]],
        expected: ["hello"],
      },
    ],
  },
  {
    name: "value([string]) positional",
    schema: c.value(v.string(), {
      name: "greeting",
    }),
    cases: [{ argvs: [["hello"]], expected: "hello" }],
  },
  {
    name: "strict_tuple([value(string)]) positional",
    schema: v.strictTuple([
      c.value(v.string(), {
        name: "greeting",
      }),
    ]),
    cases: [{ argvs: [["hello"]], expected: ["hello"] }],
  },
  {
    name: "strict_tuple([value(string), value(string)]) positional",
    schema: v.strictTuple([
      c.value(v.string(), {
        name: "greeting",
      }),
      c.value(v.string(), {
        name: "user",
      }),
    ]),
    cases: [
      {
        argvs: [["hello", "jayson"]],
        expected: ["hello", "jayson"],
      },
    ],
  },
  {
    name: "strict_tuple([value(string), option(string)]) positional",
    schema: v.strictTuple([
      c.value(v.string(), {
        name: "greeting",
      }),
      c.option(v.string(), {
        name: "user",
        longs: ["user", "person"],
      }),
    ]),
    cases: [
      {
        argvs: [["hello", "--user", "jayson"]],
        expected: ["hello", "jayson"],
      },
      {
        argvs: [["hello", "--user=jayson"]],
        expected: ["hello", "jayson"],
      },
      {
        argvs: [["hello", "--person=jayson"]],
        expected: ["hello", "jayson"],
      },
      {
        argvs: [["--person=jayson", "hello"]],
        expected: ["hello", "jayson"],
      },
      {
        argvs: [["--person", "jayson", "hello"]],
        expected: ["hello", "jayson"],
      },
    ],
  },
  {
    name: "option(boolean) flag",
    schema: c.option(v.boolean(), {
      name: "force",
      longs: ["force"],
      shorts: ["f"],
    }),
    cases: [
      {
        argvs: [["--force"]],
        expected: true,
      },
      {
        argvs: [["--force=true"]],
        expected: true,
      },
      {
        argvs: [["--force=false"]],
        expected: false,
      },
      {
        argvs: [["--force=1"]],
        expected: true,
      },
      {
        argvs: [["--force=0"]],
        expected: false,
      },
      {
        argvs: [["--force", "true"]],
        expected: true,
      },
      {
        argvs: [["--force", "false"]],
        expected: false,
      },
      {
        argvs: [["--force", "1"]],
        expected: true,
      },
      {
        argvs: [["--force", "0"]],
        expected: false,
      },
    ],
  },
  {
    name: "option(array(string))",
    schema: c.option(v.array(v.string()), {
      name: "features",
      longs: ["features"],
      shorts: ["f"],
    }),
    cases: [
      {
        argvs: [["--features=feature-1,feature-2"]],
        expected: ["feature-1", "feature-2"],
      },
      {
        argvs: [["--features=feature-1", "--features=feature-2"]],
        expected: ["feature-1", "feature-2"],
      },
      {
        argvs: [["--features", "feature-1"]],
        expected: ["feature-1"],
      },
      {
        argvs: [["--features", "feature-1", "--features", "feature-2"]],
        expected: ["feature-1", "feature-2"],
      },
      {
        argvs: [["--features", "feature-1", "--features=feature-2"]],
        expected: ["feature-1", "feature-2"],
      },
      {
        argvs: [["--features=feature-1", "--features", "feature-2"]],
        expected: ["feature-1", "feature-2"],
      },
    ],
  },
  {
    name: "value(array(string))",
    schema: c.value(v.array(v.string()), {
      name: "features",
    }),
    cases: [
      {
        argvs: [["feature-1"]],
        expected: ["feature-1"],
      },
      {
        argvs: [["feature-1", "feature-2"]],
        expected: ["feature-1", "feature-2"],
      },
      {
        argvs: [["feature-1,feature2"]],
        expected: ["feature-1,feature2"],
      },
      {
        argvs: [[]],
        expected: [],
      },
    ],
  },
  {
    name: "option(optional(string))",
    schema: c.option(v.optional(v.string()), {
      name: "out-file",
      longs: ["out-file"],
      shorts: ["o"],
    }),
    cases: [
      {
        argvs: [["--out-file=/path/to/out-file.txt"]],
        expected: "/path/to/out-file.txt",
      },
      {
        argvs: [[]],
        expected: undefined,
      },
    ],
  },
  {
    name: "option(nullable(string, 'hello'))",
    schema: c.option(v.optional(v.string(), "hello"), {
      name: "out-file",
      longs: ["out-file"],
      shorts: ["o"],
    }),
    cases: [
      {
        argvs: [["--out-file=/path/to/out-file.txt"]],
        expected: "/path/to/out-file.txt",
      },
      {
        argvs: [[]],
        expected: "hello",
      },
    ],
  },
  {
    name: "option(nullable(string))",
    schema: c.option(v.nullable(v.string()), {
      name: "out-file",
      longs: ["out-file"],
      shorts: ["o"],
    }),
    cases: [
      {
        argvs: [["--out-file=/path/to/out-file.txt"]],
        expected: "/path/to/out-file.txt",
      },
      {
        argvs: [[]],
        expected: null,
      },
    ],
  },
  {
    name: "option(nullable(string, 'hello'))",
    schema: c.option(v.nullable(v.string(), "hello"), {
      name: "out-file",
      longs: ["out-file"],
      shorts: ["o"],
    }),
    cases: [
      {
        argvs: [["--out-file=/path/to/out-file.txt"]],
        expected: "/path/to/out-file.txt",
      },
      {
        argvs: [[]],
        expected: "hello",
      },
    ],
  },
  {
    name: "option(exact_optional(string, 'hello'))",
    schema: c.option(v.exactOptional(v.string(), "hello"), {
      name: "out-file",
      longs: ["out-file"],
      shorts: ["o"],
    }),
    cases: [
      {
        argvs: [["--out-file=/path/to/out-file.txt"]],
        expected: "/path/to/out-file.txt",
      },
      {
        argvs: [["--out-file"]],
        expected: "hello",
      },
    ],
  },
  {
    name: "object({ force: option(boolean) })",
    schema: v.object({
      force: c.option(v.boolean(), { longs: ["force"], name: "force" }),
    }),
    cases: [
      {
        argvs: [["--force"]],
        expected: { force: true },
      },
    ],
  },
  {
    name: "strictObject({ force: option(boolean) })",
    schema: v.strictObject({
      force: c.option(v.boolean(), { longs: ["force"], name: "force" }),
    }),
    cases: [
      {
        argvs: [["--force"]],
        expected: { force: true },
      },
    ],
  },
]);

// todo: more objects, subcommand, help
describe(c.parse.name, () => {
  for (const fixture of fixtures) {
    const name = createFixtureName(fixture.schema);

    describe(name, () => {
      for (const case_ of fixture.cases) {
        const name = stringify(case_.expected);

        describe(name, () => {
          for (const argv of case_.argvs) {
            const name = stringify(argv);

            test(name, () => {
              // parse = argv + schema
              const parsed = c.parse(fixture.schema, argv);
              expect(parsed).toStrictEqual(case_.expected);
              ``;
              // validate = parsed + schema
              const validated = v.safeParse(fixture.schema, parsed);
              expect(validated).containSubset({
                issues: undefined,
                success: true,
              });
            });
          }
        });
      }
    });
  }
});
