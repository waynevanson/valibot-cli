import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import type { ValueToken } from "./arg.js";
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

  const optionshortvaluetoken = fc
    .record(
      {
        identifier: fc
          .string({ minLength: 1, maxLength: 1 })
          .filter((char) => /^[^\s=-]$/.test(char)),
        short: fc.constant(true),
        type: fc.constant("option"),
        value: fc.string({ minLength: 1 }),
      },
      { noNullPrototype: true },
    )
    .map((token) => [token, `-${token.identifier}=${token.value}`] as const);

  test.prop([optionshortvaluetoken])("sds", ([token, arg]) => {
    const argTokens = Array.from(createArgsTokens([arg]));
    expect(argTokens).toStrictEqual([token]);
  });

  describe("trailing", () => {
    const trailingvalue = fc.string({ minLength: 1 });
    const trailingvalues = fc.array(trailingvalue, { minLength: 1 });

    test.prop([trailingvalues])("Only values after `--`", (trailingvalues) => {
      const argTokens = Array.from(
        createArgsTokens(trailingvalues.toSpliced(0, 0, `--`)),
      );
      const expected = trailingvalues.map(
        (value): ValueToken => ({ type: "value", value }),
      );
      expect(argTokens).toStrictEqual(expected);
    });

    test("throw error when trailing values are required", () => {
      expect(() => Array.from(createArgsTokens([`--`]))).toThrowError();
    });
  });
});
