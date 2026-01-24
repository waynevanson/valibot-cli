import * as v from "valibot";
import { describe, expect, test } from "vitest";
import * as c from "../src/index.js";
import type { ParsableSchema } from "../src/parse/index.js";

function fixture<Schema extends ParsableSchema>(fixture: Fixture<Schema>) {
  return fixture;
}

interface Fixture<Schema extends ParsableSchema> {
  name: string;
  schema: Schema;
  cases: ReadonlyArray<{
    argv: ReadonlyArray<string>;
    expected: v.InferInput<Schema>;
  }>;
  only?: boolean;
}

function createFixtures<Schemas extends ReadonlyArray<ParsableSchema>>(
  fixtures: { [P in keyof Schemas]: Fixture<Schemas[P]> },
) {
  return fixtures;
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
        argv: ["--greeting=hello"],
        expected: "hello",
      },
      {
        argv: ["--greeting", "hello"],
        expected: "hello",
      },
      {
        argv: ["--quote=hello"],
        expected: "hello",
      },
      {
        argv: ["--quote", "hello"],
        expected: "hello",
      },
      {
        argv: ["-q=hello"],
        expected: "hello",
      },
      {
        argv: ["-q", "hello"],
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
        argv: ["--greeting=hello"],
        expected: "hello",
      },
      {
        argv: ["--greeting", "hello"],
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
        argv: ["-g=hello"],
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
        argv: ["--greeting=hello"],
        expected: ["hello"],
      },
      {
        argv: ["--greeting", "hello"],
        expected: ["hello"],
      },
    ],
  },
  {
    name: "value([string]) positional",
    schema: c.value(v.string(), {
      name: "greeting",
    }),
    cases: [{ argv: ["hello"], expected: "hello" }],
  },
  {
    name: "strict_tuple([value(string)]) positional",
    schema: v.strictTuple([
      c.value(v.string(), {
        name: "greeting",
      }),
    ]),
    cases: [{ argv: ["hello"], expected: ["hello"] }],
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
        argv: ["hello", "jayson"],
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
        argv: ["hello", "--user", "jayson"],
        expected: ["hello", "jayson"],
      },
      {
        argv: ["hello", "--user=jayson"],
        expected: ["hello", "jayson"],
      },
      {
        argv: ["hello", "--person=jayson"],
        expected: ["hello", "jayson"],
      },
      {
        argv: ["--person=jayson", "hello"],
        expected: ["hello", "jayson"],
      },
      {
        argv: ["--person", "jayson", "hello"],
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
        argv: ["--force"],
        expected: true,
      },
      {
        argv: ["--force=true"],
        expected: true,
      },
      {
        argv: ["--force=false"],
        expected: false,
      },
      {
        argv: ["--force=1"],
        expected: true,
      },
      {
        argv: ["--force=0"],
        expected: false,
      },
      {
        argv: ["--force", "true"],
        expected: true,
      },
      {
        argv: ["--force", "false"],
        expected: false,
      },
      {
        argv: ["--force", "1"],
        expected: true,
      },
      {
        argv: ["--force", "0"],
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
        argv: ["--features=feature-1,feature-2"],
        expected: ["feature-1", "feature-2"],
      },
      {
        argv: ["--features=feature-1", "--features=feature-2"],
        expected: ["feature-1", "feature-2"],
      },
      {
        argv: ["--features", "feature-1"],
        expected: ["feature-1"],
      },
      {
        argv: ["--features", "feature-1", "--features", "feature-2"],
        expected: ["feature-1", "feature-2"],
      },
      {
        argv: ["--features", "feature-1", "--features=feature-2"],
        expected: ["feature-1", "feature-2"],
      },
      {
        argv: ["--features=feature-1", "--features", "feature-2"],
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
        argv: ["feature-1"],
        expected: ["feature-1"],
      },
      {
        argv: ["feature-1", "feature-2"],
        expected: ["feature-1", "feature-2"],
      },
      {
        argv: ["feature-1,feature2"],
        expected: ["feature-1,feature2"],
      },
      {
        argv: [],
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
        argv: ["--out-file=/path/to/out-file.txt"],
        expected: "/path/to/out-file.txt",
      },
      {
        argv: [],
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
        argv: ["--out-file=/path/to/out-file.txt"],
        expected: "/path/to/out-file.txt",
      },
      {
        argv: [],
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
        argv: ["--out-file=/path/to/out-file.txt"],
        expected: "/path/to/out-file.txt",
      },
      {
        argv: [],
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
        argv: ["--out-file=/path/to/out-file.txt"],
        expected: "/path/to/out-file.txt",
      },
      {
        argv: [],
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
        argv: ["--out-file=/path/to/out-file.txt"],
        expected: "/path/to/out-file.txt",
      },
      {
        argv: ["--out-file"],
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
        argv: ["--force"],
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
        argv: ["--force"],
        expected: { force: true },
      },
    ],
  },
]);

// todo: optional values, objects, subcommand, help
describe(c.parse.name, () => {
  const skippable = fixtures.some((a) => a.only);
  const fixes = fixtures.map(
    (fixture) =>
      [
        fixture.name,
        { schema: fixture.schema, cases: fixture.cases, only: fixture.only },
      ] as const,
  );

  describe.each(fixes)("%s", (_name, fixture) => {
    const cases = fixture.cases.map(
      (case_) => [case_.argv.join(" "), case_] as const,
    );

    describe.skipIf(skippable && !fixture.only).each(cases)(
      "%s",
      (_name, case_) => {
        test(case_.expected?.toString() ?? "", () => {
          // parse = argv + schema
          const parsed = c.parse(fixture.schema, case_.argv);
          expect(parsed).toStrictEqual(case_.expected);

          // validate = parsed + schema
          const validated = v.safeParse(fixture.schema, parsed);
          expect(validated).containSubset({
            issues: undefined,
            success: true,
          });
        });
      },
    );
  });
});
