import type { ArgSubcommandMetadata } from "./arg-metadata.js";
import { arg } from "./arg-method.js";

export type Subcommand = never;

// todo: use variants or ensure a singleone
export function subcommand<TSchema extends Subcommand>(
  schema: TSchema,
  subcommand: Omit<ArgSubcommandMetadata, "type">,
) {
  return arg(schema, { type: "subcommand", ...subcommand });
}
