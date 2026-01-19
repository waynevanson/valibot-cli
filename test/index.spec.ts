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

describe(c.parse.name, () => {
  test.each([
    [
      "string",
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
    ]
  ])("%s", (_name, prop) => {
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
