import * as v from "valibot"
import { objectWithoutRestUndefined } from "../utils/index.js"
import { tuple } from "../utils/index.js"

export type ArgToken = OptionToken | PrevaluesToken | ValueToken
export type ArgsToken = OptionToken | ValueToken

export type OptionToken =
  | OptionLongValueToken
  | OptionLongToken
  | OptionsShortValueToken
  | OptionShortToken

export type OptionLongValueToken = {
  type: "option"
  short: false
  identifier: string
  value: string
}

export type OptionLongToken = {
  type: "option"
  short: false
  identifier: string
  value: undefined
}

export type OptionsShortValueToken = {
  type: "option"
  identifier: string
  value: string
  short: true
}

export type OptionShortToken = {
  type: "option"
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
export type ArgsTokens = Array<ArgsToken>

const LONG_FLAG_REGEXP = /(?<long>--(?<identifier>[^=]+)(=(?<value>.+))?)/

const longs = v.pipe(
  objectWithoutRestUndefined({
    long: v.string(),
    identifier: v.string(),
    value: v.optional(v.string())
  }),
  v.transform((input): OptionLongToken | OptionLongValueToken => ({
    identifier: input.identifier,
    short: false,
    type: "option",
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
    const tokens: Array<OptionShortToken | OptionsShortValueToken> = starts.map(
      (identifier) => ({
        identifier,
        short: true,
        type: "option",
        value: undefined
      })
    )

    if (identifiers.length > 0) {
      tokens.push({
        identifier: identifiers[identifiers.length - 1],
        short: true,
        type: "option",
        value: input.value
      })
    }

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

function saturate(state: State): State {
  if (state === State.Normal) {
    return State.Set
  } else {
    return State.Wired
  }
}

export function createArgsTokens(args: Array<string>): Array<ArgsToken> {
  let state: State = State.Normal

  const argsToken: Array<ArgsToken> = []

  for (const arg of args) {
    if (state > State.Normal) {
      argsToken.push({ type: "value", value: arg })
      state = saturate(state)
    }

    for (const argToken of createArgTokens(arg)) {
      switch (argToken.type) {
        case "prevalues": {
          state = saturate(state)
          break
        }

        default: {
          argsToken.push(argToken)
          break
        }
      }
    }
  }

  if (state === State.Set) {
    throw new Error("Expected to emit value arg after providing `--`")
  }

  return argsToken
}
