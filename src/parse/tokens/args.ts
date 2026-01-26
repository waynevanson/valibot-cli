import { createArgTokens, type OptionToken, type ValueToken } from "./arg.js";

export type ArgsToken = OptionToken | ValueToken;
export type ArgsTokens = IterableIterator<ArgsToken>;

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
export function* createArgsTokens(
  args: ReadonlyArray<string>,
): IterableIterator<ArgsToken> {
  const trailing = new Trailing();

  for (const arg of args) {
    if (trailing.isTrailing()) {
      yield { type: "value", value: arg };
      trailing.push();
      continue;
    }

    for (const argToken of createArgTokens(arg)) {
      switch (argToken.type) {
        case "prevalues": {
          trailing.push();
          break;
        }

        default: {
          yield argToken;
          break;
        }
      }
    }
  }

  if (trailing.isTrailingRequired()) {
    throw new Error("Expected to emit value arg after providing `--`");
  }
}
