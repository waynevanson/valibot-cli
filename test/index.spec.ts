import * as v from "valibot";
import { describe, expect, test } from "vitest";
import * as c from "../src/index.js";
import {
  createFixtureName,
  createFixtures,
  stringify,
} from "../src/utils/fixtures.js";

// todo: refactor so we can have 1 expected map into multiple schemas
const fixtures = createFixtures([
  {
    schema: c.option(v.string(), {
      name: "greeting",

      longs: ["greeting", "quote"],
      shorts: ["g", "q"],
    }),
    cases: [
      {
        argvs: [
          ["--greeting", "hello"],
          ["--greeting=hello"],
          ["-g=hello"],
          ["--quote", "hello"],
          ["--quote=hello"],
          ["-q=hello"],
        ],
        expected: "hello",
      },
    ],
  },
  {
    schema: v.strictTuple([
      c.option(v.string(), {
        name: "greeting",
        longs: ["greeting", "quote"],
        shorts: ["g", "q"],
      }),
    ]),
    cases: [
      {
        argvs: [
          ["--greeting", "hello"],
          ["--greeting=hello"],
          ["-g=hello"],
          ["--quote", "hello"],
          ["--quote=hello"],
          ["-q=hello"],
        ],
        expected: ["hello"],
      },
    ],
  },
  {
    schema: c.value(v.string(), {
      name: "greeting",
    }),
    cases: [{ argvs: [["hello"]], expected: "hello" }],
  },
  {
    schema: v.strictTuple([
      c.value(v.string(), {
        name: "greeting",
      }),
    ]),
    cases: [{ argvs: [["hello"]], expected: ["hello"] }],
  },
  {
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

// todo: more objects, subcommand, help
// `{describe,test}.each` not as easy when stringifying my own parameters.
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
