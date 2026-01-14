import * as v from "valibot"
import {
  ArgMethod,
  ArgOptionMetadata,
  getArgMethodMetadata,
  isArgOptionMetadata
} from "../methods"
import { findExactlyOne } from "../utils"
import { Matches } from "./matches"
import { ParsablePrimitiveSchema, ParsableSchema } from "./parse"

export function build<TSchema extends ParsableSchema>(
  schema: TSchema,
  matches: Matches
): v.InferInput<TSchema> {
  switch (schema.type) {
    case "string":
    case "number": {
      const metadata = getArgMethodMetadata(schema)

      console.log({ metadata })

      const match = findExactlyOne(
        matches.args,
        (value) => value.name === metadata.name
      )

      if (match === undefined) {
        throw new Error()
      }

      return stringify(schema.type, match.value)
    }

    case "array": {
      // todo: why does this not self extract?
      const schema_ = schema as Extract<
        typeof schema,
        ArgMethod<
          v.ArraySchema<
            ParsablePrimitiveSchema,
            v.ErrorMessage<v.ArrayIssue> | undefined
          >,
          ArgOptionMetadata
        >
      >

      const metadata = getArgMethodMetadata(schema_)

      if (!isArgOptionMetadata(metadata)) {
        throw new Error()
      }

      return matches.args
        .filter((match) => match.name === metadata.name)
        .map((match) => stringify(schema_.item.type, match.value))
    }

    case "strict_tuple": {
      // todo: why does this not self extract?
      const schema_ = schema as Extract<
        typeof schema,
        v.StrictTupleSchema<
          ReadonlyArray<ArgMethod<ParsablePrimitiveSchema, ArgOptionMetadata>>,
          v.ErrorMessage<v.StrictTupleIssue> | undefined
        >
      >

      const boths = schema_.items.map((item) => {
        const metadata = getArgMethodMetadata(item)

        if (!isArgOptionMetadata(metadata)) {
          throw new Error()
        }
        return { metadata, schema: item }
      })

      const zipped = zip(matches.args, boths)

      return zipped.map(([match, both]) =>
        stringify(both.schema.type, match.value)
      )
    }

    default: {
      throw new Error()
    }
  }
}

export function zip<T extends Array<unknown>, U extends Array<unknown>>(
  left: T,
  right: U
): Array<[T[number], U[number]]> {
  if (left.length !== right.length) {
    throw new Error()
  }

  return Array.from(
    { length: left.length },
    (_, index) => [left[index], right[index]] as const
  )
}

export function stringify(
  type: ParsablePrimitiveSchema["type"],
  value: string
) {
  switch (type) {
    case "number":
      return Number(value)
    case "string":
      return value
    default:
      throw new Error()
  }
}
