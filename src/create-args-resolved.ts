import { symbol } from "valibot"
import { ArgMatch } from "./create-arg-matches"
import { ArgToken } from "./tokens/createArgsToken"
import { unpipe } from "./schema"

// values that are from args
export type ArgsResolved = Array<{ id: symbol; value: string }>

export function createArgsResolved(
  matches: Array<ArgMatch>,
  tokens: Array<ArgToken>
): ArgsResolved {
  // pull a match into a ResolvedArgs

  // then after that we build the object for the schema

  const resolved: ArgsResolved = []

  // join a token and a match.
  for (const token of tokens) {
    // pull in a match

    switch (token.type) {
      case "long": {
        const match = matches.find(
          (match) =>
            (match.type === "flag" && match.longs.includes(token.identifier)) ||
            (match.type === "flag-with-value" &&
              match.longs.includes(token.identifier))
        )

        if (match === undefined) {
          throw new Error("Cannot find a long match")
        }

        resolved.push({ id: match.id, value: token.value ?? "" })
      }
      case "short": {
      }
      case "value": {
      }
    }
  }

  return resolved
}
