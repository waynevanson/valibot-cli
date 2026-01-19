import { describe } from "node:test"
import * as c from "../src"
import { test } from "vitest"
import * as v from "valibot"
import { expect } from "vitest"

describe(c.parse.name, () => {
  describe("string", () => {
    test("should pass a flag with a valsue", () => {
      const schema = c.option(v.string(), {
        name: "greeting",
        longs: ["greeting"]
      })
      const argv = ["--greeting=hello"]
      const result = c.parse(schema, argv)
      expect(result).toBe("hello")
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
      const result = c.parse(schema, argv)
      expect(result).toStrictEqual(["hello"])
    })
  })
})
