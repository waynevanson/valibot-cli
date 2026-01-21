import { createArgTokens, type OptionToken, type ValueToken } from "./arg.js";

export type ArgsToken = OptionToken | ValueToken;

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

export class ArgsTokens implements Iterable<ArgsToken> {
  constructor(private args: ReadonlyArray<string>) {}

  *[Symbol.iterator](): Iterator<ArgsToken> {
    const trailing = new Trailing();

    for (const arg of this.args) {
      if (trailing.isTrailing()) {
        yield { type: "value", value: arg };
        trailing.push();
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
}
