import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import type {
  OptionLongToken,
  OptionShortToken,
  OptionsShortValueToken,
  ValueToken,
} from "./arg.js";
import { createArgsTokens } from "./args.js";

describe(createArgsTokens, () => {
  const chars = fc
    .string({ minLength: 1 })
    .filter((string) => /^[^\s-=]+$/.test(string));

  const charargs = fc.array(chars, { minLength: 1 });

  test.prop([charargs])("OptionShortToken", (charargs) => {
    const args = charargs.map((chars) => `-${chars}`);
    const argTokens = Array.from(createArgsTokens(args));

    const expected = charargs
      .flatMap((a) => a.split(""))
      .map((char) => ({
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
      const argTokens = Array.from(createArgsTokens([arg]));

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
    const argTokens = Array.from(createArgsTokens([value]));
    const expected: ValueToken = { type: "value", value };
    expect(argTokens).toStrictEqual([expected]);
  });

  const longIdentifier = fc
    .string({ minLength: 1 })
    .filter((string) => /^(?!<(--))[^\s=]+$/.test(string));

  test.prop([longIdentifier])("OptionLongToken", (identifier) => {
    const argTokens = Array.from(createArgsTokens([`--${identifier}`]));
    expect(argTokens).toStrictEqual([
      {
        type: "option",
        short: false,
        identifier,
        value: undefined,
      } satisfies OptionLongToken,
    ]);
  });

  const trailingvalue = fc.string({ minLength: 1 });
  const trailingvalues = fc.array(trailingvalue, { minLength: 1 });

  test.prop([trailingvalues])("only values after --", (trailingvalues) => {
    const argTokens = Array.from(
      createArgsTokens(trailingvalues.toSpliced(0, 0, `--`)),
    );
    const expected = trailingvalues.map(
      (value): ValueToken => ({ type: "value", value }),
    );
    expect(argTokens).toStrictEqual(expected);
  });
});
