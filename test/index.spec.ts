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
  const parsed = c.parse(prop.schema, prop.argv)
  expect(parsed).toStrictEqual(prop.expected)

  const validated = v.safeParse(prop.schema, parsed)
  expect(validated).containSubset({
    issues: undefined,
    success: true
  })
}

describe(c.parse.name, () => {
  describe("string", () => {
    test("should pass a flag with a valsue", () => {
      const schema = c.option(v.string(), {
        name: "greeting",
        longs: ["greeting"]
      })
      const argv = ["--greeting=hello"]
      const expected = "hello"

      property({ schema, argv, expected })
    })
  })

  describe("strict_tuple string", () => {
    test("should pass a flag with a value", () => {
      const schema = v.strictTuple([
        c.option(v.string(), {
          name: "greeting",
          longs: ["greeting"]
        })
      ])
      const argv = ["--greeting=hello"]
      property({ argv, expected: ["hello"], schema })
    })
  })
})
