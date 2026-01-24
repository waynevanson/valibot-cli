import type { Only } from "../../utils/only.js";
import type { ParsableSchema } from "../parse.js";
import type { ArgsToken } from "../tokens/index.js";
import type { Unmatches, UnmatchLeaf } from "../unmatches.js";
import { getMatchForValue } from "./match.js";
import type { Matches } from "./matches.js";
import { isUnmatchForOption, isUnmatchForValue } from "./unmatch.js";

export type Matched =
  | { type: "previous"; unmatch: UnmatchLeaf }
  | { type: "matched"; match: string | boolean; unmatch: UnmatchLeaf };

export interface GetMatchedInputs {
  matches: Matches;
  previous: Only<UnmatchLeaf>;
  unmatches: Unmatches<ParsableSchema>;
}

// get the value from the token and coerce it to a datatype
export function getMatched(token: ArgsToken, inputs: GetMatchedInputs) {
  switch (token.type) {
    case "option": {
      const unmatch = inputs.unmatches.find((leaf) =>
        isUnmatchForOption(leaf, token),
      );

      // `--<identifier>=<value>`
      if (token.value !== undefined) {
        const match = getMatchForValue(unmatch, token);

        inputs.matches.add(unmatch, match);
        return;
      }

      // `--<identifier>`
      // todo: booleans where values are optional
      if (unmatch.type === "boolean" && unmatch.value !== "required") {
        inputs.matches.add(unmatch, true);
        return;
      }

      // `--identifier [value]`
      // schema expects this to have a value.
      // We will apply default if not found in this thing.
      inputs.previous.set(unmatch);
      break;
    }

    // `[value]`
    case "value": {
      // TokenOption requires identifier which go on previous token.
      const unmatch =
        inputs.previous.get() ??
        inputs.unmatches.find((leaf) =>
          isUnmatchForValue(leaf, inputs.matches),
        );

      const match = getMatchForValue(unmatch, token);

      inputs.matches.add(unmatch, match);
      break;
    }

    default:
      throw new Error();
  }
}
