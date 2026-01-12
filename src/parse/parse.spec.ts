import { describe, expect, test } from "vitest"
import { parse } from "."
import * as v from "valibot"
import { option } from "../methods"

describe(parse, () => {
  test("flag", () => {
    const schema = option(v.string(), {
      type: "option",
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
