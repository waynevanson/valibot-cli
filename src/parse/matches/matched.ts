import type { Only } from "../../utils/only.js";
import type { ParsableSchema } from "../parse.js";
import type { ArgsToken, OptionToken, ValueToken } from "../tokens/index.js";
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

export function getMatched(
  token: ArgsToken,
  inputs: GetMatchedInputs,
): Matched {
  switch (token.type) {
    case "option": {
      return getMatchedForOption(token, inputs);
    }

    case "value": {
      return getMatchedForValue(token, inputs);
    }

    default:
      throw new Error();
  }
}

export function getMatchedForOption(
  token: OptionToken,
  inputs: GetMatchedInputs,
): Matched {
  const unmatch = inputs.unmatches.find((leaf) =>
    isUnmatchForOption(leaf, token),
  );

  // `--<identifier>=<value>`
  if (token.value !== undefined) {
    const match = getMatchForValue(unmatch, token);

    return {
      type: "matched",
      unmatch,
      match,
    };
  }

  // `--<identifier>`
  // todo: booleans where values are optional
  if (unmatch.type === "boolean" && unmatch.value !== "required") {
    return {
      type: "matched",
      unmatch,
      match: true,
    };
  }

  // schema expects this to have a value
  // `--identifier [value]`
  return {
    type: "previous",
    unmatch,
  };
}

export function getMatchedForValue(
  token: ValueToken,
  inputs: GetMatchedInputs,
): Matched {
  const unmatch =
    inputs.previous.get() ??
    inputs.unmatches.find((leaf) => isUnmatchForValue(leaf, inputs.matches));

  const match = getMatchForValue(unmatch, token);

  return {
    type: "matched",
    match,
    unmatch,
  };
}
