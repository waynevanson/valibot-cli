import * as v from "valibot"
import { objectWithoutUndefined } from "../schema"

/**
 * @summary Breaks an arg into one kind of token
 * @param arg Single element from `process.argv.slice(2)`
 * @returns Array of `ArgToken`
 */
export function createRawArgTokens(arg: string): RawArgTokens {
  return v.parse(FromRegExpExec, ARG_REGEXP.exec(arg))
}

export type RawArgTokens = v.InferOutput<typeof FromRegExpExec>
export type RawArgToken = RawArgTokens[number]

const ARG_REGEXP =
  /^(?<double>--)|(?<long>--(?<identifier>[^=]+)(=(?<value>.+))?)|(?<short>-(?<identifiers>[^=]+)(=(?<value>.+))?)|(?<value>.+)$/

const RegExpGroups = v.object(
  {
    groups: v.record(v.string("group"), v.optional(v.string("value")))
  },
  "RegExp"
)

const Double = v.pipe(
  objectWithoutUndefined({
    double: v.string()
  }),
  v.transform(() => ({ type: "double" as const })),
  v.transform((kind) => [kind])
)

const Long = v.pipe(
  objectWithoutUndefined({
    long: v.string(),
    identifier: v.string(),
    value: v.optional(v.string())
  }),
  v.transform((input) => ({
    type: "long" as const,
    identifier: input.identifier,
    value: input.value
  })),
  v.transform((kind) => [kind])
)

const Short = v.pipe(
  objectWithoutUndefined({
    short: v.string(),
    identifiers: v.string(),
    value: v.optional(v.string())
  }),
  v.transform((input) =>
    Array.from(input.identifiers.slice(0, -1))
      .map((identifier) => ({
        type: "short" as const,
        identifier,
        value: undefined as string | undefined
      }))
      .concat(
        ...Array.from(input.identifiers.slice(-1)).map((identifier) => ({
          type: "short" as const,
          identifier,
          value: input.value!
        }))
      )
  )
)

const Value = v.pipe(
  objectWithoutUndefined({
    value: v.string()
  }),
  v.transform((input) => ({ type: "value" as const, value: input.value })),
  v.transform((kind) => [kind])
)

const FromRegExpExec = v.pipe(
  RegExpGroups,
  v.transform((input) => input.groups),
  v.union([Double, Long, Short, Value])
)
