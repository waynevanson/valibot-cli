import { createArgTokens, type OptionToken, type ValueToken } from "./arg.js";

export type ArgsToken = OptionToken | ValueToken;
export type ArgsTokens = Array<ArgsToken>;

export class Trailing {
  private trailing: 0 | 1 | 2 = 0;

  push() {
    if (this.trailing < 2) {
      this.trailing++;
    }
  }

  isTrailing() {
    return this.trailing > 0;
  }

  isTrailingRequired() {
    return this.trailing === 1;
  }
}

export function createArgsTokens(
  args: ReadonlyArray<string>,
): Array<ArgsToken> {
  const trailing = new Trailing();

  const argsToken: Array<ArgsToken> = [];

  for (const arg of args) {
    if (trailing.isTrailing()) {
      argsToken.push({ type: "value", value: arg });
      trailing.push();
    }

    for (const argToken of createArgTokens(arg)) {
      switch (argToken.type) {
        case "prevalues": {
          trailing.push();
          break;
        }

        default: {
          argsToken.push(argToken);
          break;
        }
      }
    }
  }

  if (trailing.isTrailingRequired()) {
    throw new Error("Expected to emit value arg after providing `--`");
  }

  return argsToken;
}
