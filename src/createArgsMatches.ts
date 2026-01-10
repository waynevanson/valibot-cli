import { ArgMetadata } from "./types"

export interface ArgsMatches {
  args: {
    valid: Array<string>
    // can't figure out why clap did this with 2 vecs of same size rather than 1
    all: Array<readonly [string, ArgMetadata]>
  }
  subcommand: null | Subcommand
}

export interface Subcommand {
  name: string
  matches: ArgsMatches
}

// arg groups are structures with all leaf values
// let's build a structure that can use the schema to check what can be matched.
// Otherwise we'll have to traverse this thing every time.

// top level should be a command
// variants for subcommands
// leafs of inputs should be args
function createArgsMatches(schema: Parsable) {
  switch (schema.type) {
    case "pipe": {
      schema.pipe
    }
  }
}

// a command is just args,
