import * as v from "valibot"
import {
  ArgMethod,
  ArgOptionMetadata,
  ArgValueMetadata,
  isArgMethod
} from "../methods"
import {
  ArgsToken,
  createArgsTokens,
  OptionLongToken,
  OptionShortToken
} from "./arg-token"

export type ParsableSchema = ArgMethod<
  v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>,
  ArgValueMetadata | ArgOptionMetadata
>

// Build the input value based on the schema and CLI args
export function parse<TSchema extends ParsableSchema>(
  schema: TSchema,
  args: Array<string>
): v.InferInput<TSchema> {
  const tokens = createArgsTokens(args)
  let flageRequiresValue: undefined | OptionLongToken | OptionShortToken

  // we probably need a pointer to an object I create
  const ref: { value: unknown } = {
    value: undefined
  }

  for (const token of tokens) {
    switch (token.type) {
      case "option": {
        // find name via long or short name
        if (token.short) {
        } else {
        }

        //
        if (token.value) {
        } else {
        }

        break
      }
      case "value": {
        break
      }
    }
  }
}

// add a predicate
export function findSchema<TSchema extends ParsableSchema>(schema: TSchema) {
  return schema
}
