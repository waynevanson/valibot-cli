import * as c from "../src/index.js"
import { describe, test, expect } from "vitest"
import * as v from "valibot"
import { ParsableSchema } from "../src/parse/index.js"

function fixture<Schema extends ParsableSchema>(fixture: Fixture<Schema>) {
  return fixture
}

interface Fixture<Schema extends ParsableSchema> {
  name: string
  schema: Schema
  cases: ReadonlyArray<{
    argv: ReadonlyArray<string>
    expected: v.InferInput<Schema>
  }>
  only?: boolean
}

const fixtures = [
  fixture({
    name: "option(string) long shorts aliases",
    schema: c.option(v.string(), {
      name: "greeting",

      longs: ["greeting", "quote"],
      shorts: ["g", "q"]
    }),
    cases: [
      {
        argv: ["--greeting=hello"],
        expected: "hello"
      },
      {
        argv: ["--greeting", "hello"],
        expected: "hello"
      },
      {
        argv: ["--quote=hello"],
        expected: "hello"
      },
      {
        argv: ["--quote", "hello"],
        expected: "hello"
      },
      {
        argv: ["-q=hello"],
        expected: "hello"
      },
      {
        argv: ["-q=hello"],
        expected: "hello"
      }
    ]
  }),
  fixture({
    name: "option(string) long",
    schema: c.option(v.string(), {
      name: "greeting",
      longs: ["greeting"]
    }),
    cases: [
      {
        argv: ["--greeting=hello"],
        expected: "hello"
      },
      {
        argv: ["--greeting", "hello"],
        expected: "hello"
      }
    ]
  }),
  fixture({
    name: "option(string) short",
    schema: c.option(v.string(), {
      name: "greeting",
      shorts: ["g"]
    }),
    cases: [
      {
        argv: ["-g=hello"],
        expected: "hello"
      }
    ]
  }),
  fixture({
    name: "strict_tuple([option(string)]) long",
    schema: v.strictTuple([
      c.option(v.string(), {
        name: "greeting",
        longs: ["greeting"]
      })
    ]),
    cases: [
      {
        argv: ["--greeting=hello"],
        expected: ["hello"]
      },
      {
        argv: ["--greeting", "hello"],
        expected: ["hello"]
      }
    ]
  }),
  fixture({
    name: "value([string]) positional",
    schema: c.value(v.string(), {
      name: "greeting"
    }),
    cases: [{ argv: ["hello"], expected: "hello" }]
  }),
  fixture({
    name: "strict_tuple([value(string)]) positional",
    schema: v.strictTuple([
      c.value(v.string(), {
        name: "greeting"
      })
    ]),
    cases: [{ argv: ["hello"], expected: ["hello"] }]
  }),
  fixture({
    name: "strict_tuple([value(string), value(string)]) positional",
    schema: v.strictTuple([
      c.value(v.string(), {
        name: "greeting"
      }),
      c.value(v.string(), {
        name: "user"
      })
    ]),
    cases: [
      {
        argv: ["hello", "jayson"],
        expected: ["hello", "jayson"]
      }
    ]
  }),
  fixture({
    name: "strict_tuple([value(string), option(string)]) positional",
    schema: v.strictTuple([
      c.value(v.string(), {
        name: "greeting"
      }),
      c.option(v.string(), {
        name: "user",
        longs: ["user", "person"]
      })
    ]),
    cases: [
      {
        argv: ["hello", "--user", "jayson"],
        expected: ["hello", "jayson"]
      },
      {
        argv: ["hello", "--user=jayson"],
        expected: ["hello", "jayson"]
      },
      {
        argv: ["hello", "--person=jayson"],
        expected: ["hello", "jayson"]
      },
      {
        argv: ["--person=jayson", "hello"],
        expected: ["hello", "jayson"]
      },
      {
        argv: ["--person", "jayson", "hello"],
        expected: ["hello", "jayson"]
      }
    ]
  })
] satisfies ReadonlyArray<Fixture<ParsableSchema>>

describe(c.parse.name, () => {
  const skippable = fixtures.some((a) => a.only)
  const fixes = fixtures.map(
    (fixture) =>
      [
        fixture.name,
        { schema: fixture.schema, cases: fixture.cases, only: fixture.only }
      ] as const
  )

  describe.each(fixes)("%s", (_name, fixture) => {
    const cases = fixture.cases.map(
      (case_) => [case_.argv.join(" "), case_] as const
    )

    test.skipIf(skippable && !fixture.only).each(cases)(
      "%s",
      (_name, case_) => {
        // parse = argv + schema
        const parsed = c.parse(fixture.schema, case_.argv)
        expect(parsed).toStrictEqual(case_.expected)

        // validate = parsed + schema
        const validated = v.safeParse(fixture.schema, parsed)
        expect(validated).containSubset({
          issues: undefined,
          success: true
        })
      }
    )
  })
})
