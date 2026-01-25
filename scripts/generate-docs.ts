import * as fs from "node:fs";
import * as path from "node:path";
import { parseSync } from "oxc-parser";

const filename = path.resolve("./src/parse/tokens/arg.ts");
const ast = parseSync(
  filename,
  fs.readFileSync(filename, { encoding: "utf8" }),
);

console.log(ast.program.body);
