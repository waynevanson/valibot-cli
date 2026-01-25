import * as fs from "node:fs";
import * as path from "node:path";
import { parseSync, Visitor } from "oxc-parser";

// goal: generate typescript api from src files
//
// for public API.
// types: name, params, result, example

const filename = path.resolve("./src/index.ts");
const ast = parseSync(
  filename,
  fs.readFileSync(filename, { encoding: "utf8" }),
  { astType: "ts", sourceType: "module" },
);

const visitations = [];

const visitor = new Visitor({});
