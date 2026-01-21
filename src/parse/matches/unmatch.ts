import {
  ArgValueMetadata,
  ArgOptionMetadata
} from "../../methods/arg-metadata.js"
import { OptionToken } from "../tokens/index.js"
import { Unmatches, find } from "../unmatches.js"
import { Matches } from "./matches.js"
import * as v from "valibot"

export function getUnmatchForValue(matches: Matches, unmatches: Unmatches) {
  return find(unmatches, (unmatch) => {
    switch (unmatch.type) {
      case "string": {
        return (
          v.is(ArgValueMetadata, unmatch.metadata) && !matches.has(unmatch.ref)
        )
      }

      case "boolean": {
        return v.is(ArgOptionMetadata, unmatch.metadata)
      }

      default: {
        throw new Error()
      }
    }
  })
}

export function getUnmatchForOption(unmatches: Unmatches, token: OptionToken) {
  return find(unmatches, (unmatches) => {
    {
      if (!v.is(ArgOptionMetadata, unmatches.metadata)) {
        return false
      }

      const identifiers = token.short
        ? unmatches.metadata.shorts
        : unmatches.metadata.longs

      return identifiers.includes(token.identifier)
    }
  })
}
