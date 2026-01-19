import * as c from "../src/index.js"
import { describe, test, expect } from "vitest"
import * as v from "valibot"
import { ParsableSchema } from "../src/parse/index.js"

interface Prop<Schema extends ParsableSchema> {
  schema: Schema
  argv: Array<string>
  expected: v.InferInput<Schema>
}

function property<Schema extends ParsableSchema>(prop: Prop<Schema>) {
  return prop
}

const fixtures = [
  [
    "string unspaced",
    property({
      schema: c.option(v.string(), {
        name: "greeting",
        longs: ["greeting"]
      }),
      argv: ["--greeting=hello"],
      expected: "hello"
    })
  ],
  [
    "string spaced",
    property({
      schema: c.option(v.string(), {
        name: "greeting",
        longs: ["greeting"]
      }),
      argv: ["--greeting", "hello"],
      expected: "hello"
    })
  ],
  [
    "string short",
    property({
      schema: c.option(v.string(), {
        name: "greeting",
        shorts: ["g"]
      }),
      argv: ["-g=hello"],
      expected: "hello"
    })
  ],
  [
    "strict_tuple string",
    property({
      schema: v.strictTuple([
        c.option(v.string(), {
          name: "greeting",
          longs: ["greeting"]
        })
      ]),
      argv: ["--greeting=hello"],
      expected: ["hello"]
    })
  ],
  [
    "string positional",
    property({
      schema: c.value(v.string(), {
        name: "greeting"
      }),
      argv: ["hello"],
      expected: "hello"
    })
  ]
] as const

describe(c.parse.name, () => {
  test.each(fixtures)("%s", (_name, prop) => {
    // parse = argv + schema
    const parsed = c.parse(prop.schema, prop.argv)
    expect(parsed).toStrictEqual(prop.expected)

    // validate = parsed + schema
    const validated = v.safeParse(prop.schema, parsed)
    expect(validated).containSubset({
      issues: undefined,
      success: true
    })
  })
})
