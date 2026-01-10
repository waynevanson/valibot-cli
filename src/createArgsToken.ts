import { createRawArgTokens, RawArgToken } from "./createRawArgTokens"

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
    if (valuesOnly) {
      results.push({ type: "value" as const, value: arg })
      valuesOnlyEmitted = true
      continue
    }

    // kind of hides a bit to much away
    for (const token of createRawArgTokens(arg)) {
      switch (token.type) {
        case "double": {
          valuesOnly = true
          continue
        }
        default: {
          results.push(token)
        }
      }
    }
  }

  if (valuesOnly && !valuesOnlyEmitted) {
    throw new Error("Expected to emit value arg after providing `--`")
  }

  return results
}
