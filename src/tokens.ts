import * as v from "valibot"
import { objectWithoutRestUndefined } from "./schema"
import { tuple } from "./utils"

export type ArgToken = FlagToken | PrevaluesToken | ValueToken
export type ArgsToken = FlagToken | ValueToken

export type FlagToken =
  | FlagLongValueToken
  | FlagLongToken
  | FlagShortValueToken
  | FlagShortToken

export type FlagLongValueToken = {
  type: "flag"
  short: false
  identifier: string
  value: string
}

export type FlagLongToken = {
  type: "flag"
  short: false
  identifier: string
  value: undefined
}

export type FlagShortValueToken = {
  type: "flag"
  identifier: string
  value: string
  short: true
}

export type FlagShortToken = {
  type: "flag"
  identifier: string
  short: true
  value: undefined
}

export type PrevaluesToken = {
  type: "prevalues"
}

export type ValueToken = {
  type: "value"
  value: string
}

export type ArgTokens = Array<ArgToken>

const LONG_FLAG_REGEXP = /(?<long>--(?<identifier>[^=]+)(=(?<value>.+))?)/

const longs = v.pipe(
  objectWithoutRestUndefined({
    long: v.string(),
    identifier: v.string(),
    value: v.optional(v.string())
  }),
  v.transform((input): FlagLongToken | FlagLongValueToken => ({
    identifier: input.identifier,
    short: false,
    type: "flag",
    value: input.value
  })),
  v.transform(tuple)
)

const SHORT_FLAG_REGEXP = /(?<short>-(?<identifiers>[^=]+)(=(?<value>.+))?)/

const shorts = v.pipe(
  objectWithoutRestUndefined({
    short: v.string(),
    identifiers: v.string(),
    value: v.optional(v.string())
  }),
  v.transform((input) => {
    const identifiers = Array.from(input.identifiers)

    const starts = identifiers.slice(0, -1)
    const tokens: Array<FlagShortToken | FlagShortValueToken> = starts.map(
      (identifier) => ({
        identifier,
        short: true,
        type: "flag",
        value: undefined
      })
    )

    if (identifiers.length > 0) {
      tokens.push({
        identifier: identifiers[identifiers.length - 1],
        short: true,
        type: "flag",
        value: input.value
      })
    }
    valu

    return tokens
  })
)

const PREVALUES = /(?<prevalues>--)/

const prevalues = v.pipe(
  objectWithoutRestUndefined({
    prevalues: v.string()
  }),
  v.transform((): PrevaluesToken => ({ type: "prevalues" })),
  v.transform(tuple)
)

const VALUE_REGEXP = /(?<value>.+)/

const value = v.pipe(
  objectWithoutRestUndefined({ value: v.string() }),
  v.transform((input): ValueToken => ({ type: "value", value: input.value })),
  v.transform(tuple)
)

const patterns = [LONG_FLAG_REGEXP, SHORT_FLAG_REGEXP, PREVALUES, VALUE_REGEXP]

const ALL_REGEXP = new RegExp(
  `^(?:${patterns.map((pattern) => pattern.source).join("|")})$`
)

const all = v.union([longs, shorts, prevalues, value])

export function createArgTokens(arg: string) {
  const matches = ALL_REGEXP.exec(arg)

  if (matches === null) {
    throw new Error("Expected matches of an arg to be non-nullable")
  }

  if (matches.groups === undefined) {
    throw new Error("Expected groups to be defined")
  }

  return v.parse(all, matches.groups)
}

export const State = {
  Normal: 0,
  Set: 1,
  Wired: 2
} as const

export type State = (typeof State)[keyof typeof State]

export function createArgsTokens(args: Array<string>): Array<ArgToken> {
  let state: State = State.Normal

  const results: Array<ArgToken> = []

  for (const arg of args) {
    if (state > State.Normal) {
      results.push({ type: "value", value: arg })
      state = State.Wired
    }

    for (const argToken of createArgTokens(arg)) {
      switch (argToken.type) {
        case "prevalues": {
          state = State.Set
          break
        }

        default: {
          results.push(argToken)
          break
        }
      }
    }
  }

  if (state === State.Set) {
    throw new Error("Expected to emit value arg after providing `--`")
  }

  return results
}
