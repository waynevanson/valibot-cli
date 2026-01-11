import * as v from "valibot"
import { describe, test } from "vitest"
import { createArgsMatches } from "./createArgsMatches"
import { command } from "./actions"

/// How can we constrain the action so it only operates on the right schema?
describe("createArgsMatches", () => {
  test("array", () => {
    const schema = command(v.pipe(v.array(v.string())))
    const argsMatches = createArgsMatches(schema)
  })
})
