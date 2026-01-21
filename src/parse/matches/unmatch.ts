import * as v from "valibot";
import { ArgOptionMetadata, ArgValueMetadata } from "../../methods/index.js";
import type { OptionToken } from "../tokens/index.js";
import { find, type Unmatch } from "../unmatches.js";
import type { Matches } from "./matches.js";

export function getUnmatchForValue(matches: Matches, unmatches: Unmatch) {
  return find(unmatches, (unmatch) => {
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

export function getUnmatchForOption(unmatches: Unmatch, token: OptionToken) {
  return find(unmatches, (unmatches) => {
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
