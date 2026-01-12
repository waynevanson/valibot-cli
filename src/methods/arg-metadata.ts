export interface ArgValueMetadata {
  type: "value"
  name: string
}

export interface ArgFlagMetadata {
  type: "flag"
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
  | ArgFlagMetadata
  | ArgSubcommandMetadata

export function isArgValueMetadata(
  value: ArgMetadata
): value is ArgValueMetadata {
  return value.type === "value"
}

export function isArgFlagMetadata(
  value: ArgMetadata
): value is ArgFlagMetadata {
  return value.type === "flag"
}

export function isArgSubcommandMetadata(
  value: ArgMetadata
): value is ArgSubcommandMetadata {
  return value.type === "subcommand"
}
