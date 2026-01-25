import * as v from "valibot";
import { ExpectedError } from "../../utils/error.js";
import { objectWithoutRestUndefined, tuple } from "../../utils/index.js";

export type ArgToken = OptionToken | PrevaluesToken | ValueToken;

export type OptionToken =
  | OptionLongValueToken
  | OptionLongToken
  | OptionsShortValueToken
  | OptionShortToken;

export type OptionLongValueToken = {
  readonly type: "option";
  readonly short: false;
  readonly identifier: string;
  readonly value: string;
};

export type OptionLongToken = {
  readonly type: "option";
  readonly short: false;
  readonly identifier: string;
  readonly value: undefined;
};

export type OptionsShortValueToken = {
  readonly type: "option";
  readonly identifier: string;
  readonly value: string;
  readonly short: true;
};

export type OptionShortToken = {
  readonly type: "option";
  readonly identifier: string;
  readonly short: true;
  readonly value: undefined;
};

export type PrevaluesToken = {
  readonly type: "prevalues";
};

export type ValueToken = {
  readonly type: "value";
  readonly value: string;
};

const LONG_FLAG_REGEXP = /(?<long>--(?<identifier>[^=]+)(=(?<value>.+))?)/;

const longs = v.pipe(
  objectWithoutRestUndefined({
    long: v.string(),
    identifier: v.string(),
    value: v.optional(v.string()),
  }),
  v.transform((input): OptionLongToken | OptionLongValueToken => ({
    identifier: input.identifier,
    short: false,
    type: "option",
    value: input.value,
  })),
  v.transform(tuple),
);

const SHORT_FLAG_REGEXP = /(?<short>-(?<identifiers>[^=\s-]+)(=(?<value>.+))?)/;

const shorts = v.pipe(
  objectWithoutRestUndefined({
    short: v.string(),
    identifiers: v.string(),
    value: v.optional(v.string()),
  }),
  v.transform((input) => {
    const identifiers = Array.from(input.identifiers);

    const starts = identifiers.slice(0, -1);
    const tokens: Array<OptionShortToken | OptionsShortValueToken> = starts.map(
      (identifier) => ({
        identifier,
        short: true,
        type: "option",
        value: undefined,
      }),
    );

    /* v8 ignore if -- @preserve */
    if (identifiers.length === 0) {
      throw new ExpectedError(
        `Expected identifiers to contain at least 1 identifier`,
      );
    }

    tokens.push({
      identifier: identifiers[identifiers.length - 1],
      short: true,
      type: "option",
      value: input.value,
    });

    return tokens;
  }),
);

const PREVALUES = /(?<prevalues>--)/;

const prevalues = v.pipe(
  objectWithoutRestUndefined({
    prevalues: v.string(),
  }),
  v.transform((): PrevaluesToken => ({ type: "prevalues" })),
  v.transform(tuple),
);

const VALUE_REGEXP = /(?<value>.+)/;

const value = v.pipe(
  objectWithoutRestUndefined({ value: v.string() }),
  v.transform((input): ValueToken => ({ type: "value", value: input.value })),
  v.transform(tuple),
);

const patterns = [LONG_FLAG_REGEXP, SHORT_FLAG_REGEXP, PREVALUES, VALUE_REGEXP];

const ALL_REGEXP = new RegExp(
  `^(?:${patterns.map((pattern) => pattern.source).join("|")})$`,
);

const all = v.union([longs, shorts, prevalues, value]);

export function createArgTokens(arg: string) {
  const matches = ALL_REGEXP.exec(arg);

  /* v8 ignore if -- @preserve */
  if (matches === null) {
    throw new ExpectedError("Expected matches of an arg to be non-nullable");
  }

  /* v8 ignore if -- @preserve */
  if (matches.groups === undefined) {
    throw new ExpectedError("Expected groups to be defined");
  }

  return v.parse(all, matches.groups);
}
