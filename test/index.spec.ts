import * as v from "valibot";
import { describe, expect, test } from "vitest";
import * as c from "../src/index.js";
import {
  createFixtureName,
  createFixturesByExpected,
  createFixturesBySchema,
  stringify,
} from "../src/utils/fixtures.js";

// todo: error cases
const fixturesByExpected = createFixturesByExpected([
  {
    expected: "hello",
    cases: [
      {
        schema: c.option(v.string(), {
          name: "greeting",
          longs: ["greeting", "quote"],
          shorts: ["g", "q"],
        }),
        argvs: [
          ["--greeting", "hello"],
          ["--greeting=hello"],
          ["-g=hello"],
          ["--quote", "hello"],
          ["--quote=hello"],
          ["-q=hello"],
        ],
      },
    ],
  },
  {
    expected: ["hello"],
    cases: [
      {
        schema: v.strictTuple([
          c.option(v.string(), {
            name: "greeting",
            longs: ["greeting", "quote"],
            shorts: ["g", "q"],
          }),
        ]),
        argvs: [
          ["--greeting", "hello"],
          ["--greeting=hello"],
          ["-g=hello"],
          ["--quote", "hello"],
          ["--quote=hello"],
          ["-q=hello"],
        ],
      },
    ],
  },
  {
    expected: "hello",
    cases: [
      {
        schema: c.value(v.string(), {
          name: "greeting",
        }),
        argvs: [["hello"]],
      },
    ],
  },
  {
    expected: ["hello"],
    cases: [
      {
        schema: v.strictTuple([
          c.value(v.string(), {
            name: "greeting",
          }),
        ]),
        argvs: [["hello"]],
      },
    ],
  },
  {
    expected: ["hello", "jayson"],
    cases: [
      {
        argvs: [["hello", "jayson"]],
        schema: v.strictTuple([
          c.value(v.string(), {
            name: "greeting",
          }),
          c.value(v.string(), {
            name: "user",
          }),
        ]),
      },
    ],
  },
  {
    expected: ["hello", "jayson"],
    cases: [
      {
        schema: v.strictTuple([
          c.value(v.string(), {
            name: "greeting",
          }),
          c.option(v.string(), {
            name: "user",
            longs: ["user", "person"],
          }),
        ]),
        argvs: [
          ["hello", "--user", "jayson"],
          ["hello", "--user=jayson"],
          ["hello", "--person=jayson"],
          ["--person=jayson", "hello"],
          ["--person", "jayson", "hello"],
        ],
      },
    ],
  },
  {
    expected: true,
    cases: [
      {
        schema: c.option(v.boolean(), {
          name: "force",
          longs: ["force"],
          shorts: ["f"],
        }),
        argvs: [
          ["--force"],
          ["--force=true"],
          ["--force", "true"],
          ["--force=1"],
          ["--force", "1"],
        ],
      },
    ],
  },
  {
    expected: false,
    cases: [
      {
        schema: c.option(v.boolean(), {
          name: "force",
          longs: ["force"],
          shorts: ["f"],
        }),
        argvs: [
          ["--force=false"],
          ["--force", "false"],
          ["--force=0"],
          ["--force", "0"],
        ],
      },
    ],
  },
  {
    expected: ["feature-1"],
    cases: [
      {
        schema: c.option(v.array(v.string()), {
          name: "features",
          longs: ["features"],
          shorts: ["f"],
        }),
        argvs: [["--features", "feature-1"]],
      },
    ],
  },
  {
    expected: ["feature-1", "feature-2"],
    cases: [
      {
        schema: c.option(v.array(v.string()), {
          name: "features",
          longs: ["features"],
          shorts: ["f"],
        }),
        argvs: [
          ["--features=feature-1,feature-2"],
          ["--features=feature-1", "--features=feature-2"],
          ["--features", "feature-1", "--features", "feature-2"],
          ["--features", "feature-1", "--features=feature-2"],
          ["--features=feature-1", "--features", "feature-2"],
        ],
      },
    ],
  },
]);

// todo: more objects, subcommand, help
// `{describe,test}.each` not as easy when stringifying my own parameters.
describe(c.parse.name, () => {
  for (const fixture of fixturesByExpected) {
    const name = stringify(fixture.expected);

    describe(name, () => {
      for (const case_ of fixture.cases) {
        const name = createFixtureName(case_.schema);

        describe(name, () => {
          for (const argv of case_.argvs) {
            const name = stringify(argv);

            test(name, () => {
              // parse = argv + schema
              const parsed = c.parse(case_.schema, argv);
              expect(parsed).toStrictEqual(fixture.expected);

              // validate = parsed + schema
              const validated = v.safeParse(case_.schema, parsed);
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

const fixturesBySchema = createFixturesBySchema([
  {
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

describe(c.parse.name, () => {
  for (const fixture of fixturesBySchema) {
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
