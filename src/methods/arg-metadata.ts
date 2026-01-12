export interface ArgValueMetadata {
  type: "value"
  name: string
}

// default, schema, multiple, required
// required and default are the same?
export interface ArgOptionMetadata {
  type: "option"
  name: string
  longs: Array<string>
  shorts: Array<string>
}

export interface ArgSubcommandMetadata {
  type: "subcommand"
  name: string
}

export type ArgMetadata =
  | ArgValueMetadata
  | ArgOptionMetadata
  | ArgSubcommandMetadata

export function isArgValueMetadata(
  value: ArgMetadata
): value is ArgValueMetadata {
  return value.type === "value"
}

export function isArgOptionMetadata(
  value: ArgMetadata
): value is ArgOptionMetadata {
  return value.type === "option"
}

export function isArgSubcommandMetadata(
  value: ArgMetadata
): value is ArgSubcommandMetadata {
  return value.type === "subcommand"
}
