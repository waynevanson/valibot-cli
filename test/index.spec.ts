import { describe } from "node:test"
import * as c from "../src"
import { test } from "vitest"
import * as v from "valibot"
import { expect } from "vitest"

describe(c.parse.name, () => {
  test("should pass a flag with a value", () => {
    const schema = c.option(v.string(), {
      longs: ["greeting"],
      shorts: [],
      name: "greeting"
    })
    const argv = ["--greeting=hello"]
    const result = c.parse(schema, argv)
    expect(result).toBe("hello")
  })
})
