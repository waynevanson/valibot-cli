import * as v from "valibot";
import {
  ArgOptionMetadata,
  ArgValueMetadata,
} from "../../methods/arg-metadata.js";
import { Only } from "../../utils/only.js";
import { type ArgsTokens, OptionToken } from "../tokens/args.js";
import { find, type Unmatches, type UnmatchesLeaf } from "../unmatches.js";
import { type GetMatchedInputs, getMatched } from "./matched.js";
import { Matches } from "./matches.js";

export function createMatches(
  unmatches: Unmatches,
  tokens: ArgsTokens,
): Matches {
  const matches = new Matches();
  const previous = new Only<UnmatchesLeaf>();

  const inputs: GetMatchedInputs = { matches, previous, unmatches };

  for (const token of tokens) {
    const matched = getMatched(token, inputs);

    switch (matched.type) {
      case "previous": {
        previous.set(matched.unmatch);
        break;
      }

      case "matched": {
        matches.add(matched.unmatch, matched.match);
        break;
      }

      default: {
        throw new Error();
      }
    }
  }

  // resolve the flag as a boolean if we had one
  const unmatch = previous.get();

  if (unmatch !== undefined) {
    matches.set(unmatch.ref, true);
  }

  return matches;
}
