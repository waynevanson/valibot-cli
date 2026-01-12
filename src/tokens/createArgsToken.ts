import * as v from "valibot"
export type ArgToken = Exclude<RawArgToken, { type: "double" }>
export type ArgTokens = Array<ArgToken>

/**
 * @summary Replaces and correctly sequences `double` raw token with `value` token.
 * @param args `process.argv.slice(2)`
 * @returns List of Arg tokens
 * @throws
 */
export function createArgsTokens(args: Array<string>): Array<ArgToken> {
  let valuesOnly = false
  let valuesOnlyEmitted = false

  const results: Array<ArgToken> = []

  for (const arg of args) {
    const matches = /^--(?<identifier>[^=]+)(=(?<value>.+))$/.exec(arg)

    if (matches === null) {
      throw new Error("Expected to find a match")
    }

    const groups = v.parse(
      v.strictObject({ identifier: v.string(), value: v.string() }),
      matches.groups
    )

    results.push({
      type: "long",
      identifier: groups.identifier,
      value: groups.value
    })
  }

  if (valuesOnly && !valuesOnlyEmitted) {
    throw new Error("Expected to emit value arg after providing `--`")
  }

  return results
}
