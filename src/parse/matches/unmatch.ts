import * as v from "valibot";
import { ArgOptionMetadata, ArgValueMetadata } from "../../methods/index.js";
import type { ParsableSchema } from "../parse.js";
import type { OptionToken } from "../tokens/index.js";
import type { Unmatches } from "../unmatches.js";
import type { Matches } from "./matches.js";

export function getUnmatchForValue(
  matches: Matches,
  unmatches: Unmatches<ParsableSchema>,
) {
  return unmatches.find((unmatch) => {
    switch (unmatch.type) {
      case "string": {
        return (
          v.is(ArgValueMetadata, unmatch.metadata) && !matches.has(unmatch.ref)
        );
      }

      case "boolean": {
        return v.is(ArgOptionMetadata, unmatch.metadata);
      }

      default: {
        throw new Error();
      }
    }
  });
}

export function getUnmatchForOption(
  unmatches: Unmatches<ParsableSchema>,
  token: OptionToken,
) {
  return unmatches.find((unmatches) => {
    {
      if (!v.is(ArgOptionMetadata, unmatches.metadata)) {
        return false;
      }

      const identifiers = token.short
        ? unmatches.metadata.shorts
        : unmatches.metadata.longs;

      return identifiers.includes(token.identifier);
    }
  });
}
