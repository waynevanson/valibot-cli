import { describe, test, expect } from "vitest"
import * as s from "./schemable"
import * as v from "valibot"

describe("", () => {
  test("bro", () => {
    const Schema = s.StringSchema()
    const Value = v.string()
    v.parse(Schema, Value)
  })

  test("brah", () => {
    const Schema = s.StrictTuple([s.StringSchema()])
    const Value = v.strictTuple([v.string()])
    v.parse(Schema, Value)
  })

  test("brah", () => {
    const Schema = s.MetadataSchema(v.object({ hello: v.literal("world") }))
    const Value = v.metadata({ hello: "world" })
    v.parse(Schema, Value)
  })

  test.skip("brah", () => {
    const Schema = s.SchemaWithPipe(s.StringSchema())
    const Value = v.pipe(v.string())
    let a = v.safeParse(Schema, Value)
    console.log(a.issues?.[0])
    if (!a.success) throw a.issues[0]
  })
})
