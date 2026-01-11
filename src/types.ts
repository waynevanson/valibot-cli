export interface ArgValue {
  type: "value"
  name: string
  aliases: Array<string>
}

export interface ArgFlag {
  type: "flag"
}

export interface ArgCommand {
  type: "command"
}

export interface ArgSubcommand {
  type: "subcommand"
  name: string
}

export type ArgKind = ArgValue | ArgFlag | ArgCommand | ArgSubcommand

export type FindExactlyOne<
  T extends readonly unknown[],
  Target,
  Count extends Target[] = []
> = T extends [infer Head, ...infer Tail]
  ? Head extends Target
    ? FindExactlyOne<Tail, Target, [...Count, Head]>
    : FindExactlyOne<Tail, Target, Count>
  : Count["length"] extends 1
    ? Count[0]
    : never
