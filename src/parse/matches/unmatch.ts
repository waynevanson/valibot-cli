import * as v from "valibot";
import {
  ArgOptionMetadata,
  ArgSubcommandMetadata,
  ArgValueMetadata,
} from "../../methods/index.js";
import type { OptionToken } from "../tokens/index.js";
import type { UnmatchLeaf } from "../unmatches.js";
import type { Matches } from "./matches.js";

export function isUnmatchForValue(unmatch: UnmatchLeaf, matches: Matches) {
  switch (unmatch.type) {
    case "string": {
      return (
        v.is(ArgValueMetadata, unmatch.metadata) && !matches.has(unmatch.ref)
      );
    }

    case "boolean": {
      return v.is(ArgOptionMetadata, unmatch.metadata);
    }

    case "array": {
      return !v.is(ArgSubcommandMetadata, unmatch.metadata);
    }

    default: {
      throw new Error();
    }
  }
}

export function isUnmatchForOption(unmatches: UnmatchLeaf, token: OptionToken) {
  if (!v.is(ArgOptionMetadata, unmatches.metadata)) {
    return false;
  }

  const identifiers = token.short
    ? unmatches.metadata.shorts
    : unmatches.metadata.longs;

  return identifiers.includes(token.identifier);
}
