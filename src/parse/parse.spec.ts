import { describe, expect, test } from "vitest"
import { parse } from "."
import * as v from "valibot"
import { option } from "../methods"

describe(parse, () => {
  test("flag string", () => {
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

  test("flag number", () => {
    const schema = option(v.number(), {
      type: "option",
      name: "greeting",
      longs: ["greeting"],
      shorts: []
    })
    const args = ["--greeting=3"]
    const input = parse(schema, args)
    const output = v.parse(schema, input)
    expect(output).toBe(3)
  })

  test("multiple flag 0", () => {
    // infinite for now
    const schema = option(v.array(v.string()), {
      type: "option",
      name: "greeting",
      longs: ["greeting"],
      shorts: []
    })
    const args: Array<string> = []
    const input = parse(schema, args)
    const output = v.parse(schema, input)
    expect(output).toStrictEqual([])
  })

  test("multiple flag 1", () => {
    // infinite for now
    const schema = option(v.array(v.string()), {
      type: "option",
      name: "greeting",
      longs: ["greeting"],
      shorts: []
    })
    const args = ["--greeting=hello"]
    const input = parse(schema, args)
    const output = v.parse(schema, input)
    expect(output).toStrictEqual(["hello"])
  })

  test("multiple flag 2", () => {
    // infinite for now
    const schema = option(v.array(v.string()), {
      type: "option",
      name: "greeting",
      longs: ["greeting"],
      shorts: []
    })
    const args = ["--greeting=hello", "--greeting=world"]
    const input = parse(schema, args)
    const output = v.parse(schema, input)
    expect(output).toStrictEqual(["hello", "world"])
  })
})
