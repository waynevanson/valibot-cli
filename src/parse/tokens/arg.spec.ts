import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { createArgTokens } from "./arg.js";

describe(createArgTokens, () => {
  const chars = fc
    .string({ minLength: 1 })
    .filter((string) => /^[^\s-=]+$/.test(string));

  test.prop([chars])("", (chars) => {
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
});
