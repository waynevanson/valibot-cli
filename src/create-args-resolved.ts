import {
  ArgMatch,
  CommandableSchemaKind,
  createArgMatches
} from "./create-arg-matches"
import { ArgToken, createArgsTokens } from "./tokens/createArgsToken"

export type ArgsResolved = Array<{ id: symbol; value: string }>

export function createArgsResolved<TSchema extends CommandableSchemaKind>(
  matches: Array<ArgMatch>,
  tokens: Array<ArgToken>
): ArgsResolved {
  // pull a match into a ResolvedArgs

  // then after that we build the object for the schema

  const resolved: ArgsResolved = []

  for (const token of tokens) {
    // pull in a match

    switch (token.type) {
      case "long": {
      }
    }
  }

  return resolved
}
