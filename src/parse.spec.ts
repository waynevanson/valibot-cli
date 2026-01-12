import { describe, expect, test } from "vitest"
import { parse } from "./parse"
import * as v from "valibot"
import { flag } from "./methods"

describe(parse, () => {
  test("flag", () => {
    const schema = flag(v.string(), {
      type: "flag",
      name: "greeting",
      longs: ["greeting"],
      shorts: []
    })
    const args = ["--greeting=hello"]
    const input = parse(schema, args)
    const output = v.parse(schema, input)
    expect(output).toBe("hello")
  })
})
