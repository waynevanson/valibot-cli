import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  createArgTokens,
  type OptionShortToken,
  type OptionsShortValueToken,
  type ValueToken,
} from "./arg.js";

describe(createArgTokens, () => {
  const chars = fc
    .string({ minLength: 1 })
    .filter((string) => /^[^\s-=]+$/.test(string));

  test.prop([chars])("OptionShortToken", (chars) => {
    const arg = `-${chars}`;
    const argTokens = createArgTokens(arg);

    const expected = chars.split("").map((char) => ({
      identifier: char,
      short: true,
      type: "option",
      value: undefined,
    }));

    expect(argTokens).toStrictEqual(expected);
  });

  const optionValue = fc
    .string({ minLength: 1 })
    .filter((string) => !string.includes(" "));

  test.prop([chars, optionValue], { verbose: true })(
    "OptionShortValueToken",
    (chars, value) => {
      const arg = `-${chars}=${value}`;
      const argTokens = createArgTokens(arg);

      const bodies = chars
        .slice(0, -1)
        .split("")
        .map(
          (char): OptionShortToken => ({
            identifier: char,
            short: true,
            type: "option",
            value: undefined,
          }),
        );

      const optionShortTokens = argTokens.slice(0, -1);
      expect(optionShortTokens).toStrictEqual(bodies);

      const last: OptionsShortValueToken = {
        type: "option",
        identifier: chars[chars.length - 1],
        short: true,
        value,
      };

      const optionShortValueToken = argTokens.at(-1);
      expect(optionShortValueToken).toStrictEqual(last);
    },
  );

  const value = fc
    .string({ minLength: 1 })
    .filter((string) => /^[^(--)][^\s=]+$/.test(string));

  test.prop([value])("ValueToken", (value) => {
    const argTokens = createArgTokens(value);
    const expected: ValueToken = { type: "value", value };
    expect(argTokens).toStrictEqual([expected]);
  });
});
