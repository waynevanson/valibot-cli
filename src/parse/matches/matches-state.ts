import { UnmatchesNodeString, UnmatchesNodeBoolean } from "../unmatches.js"

export class MatchesState {
  matches = new Matches()
  previous: undefined | UnmatchesNodeString | UnmatchesNodeBoolean = undefined

  // consume the previous match if it existed
  prev() {
    if (this.previous === undefined) {
      return undefined
    }

    const unmatch = this.previous
    this.previous = undefined

    return unmatch
  }
}

export class Matches extends Map<symbol, Match> {}

export type Match = {
  name: string
  value: MatchValue
}

export type MatchValue = MatchValueString | MatchValueBoolean

export type MatchValueString = {
  type: "string"
  value: string
}

export type MatchValueBoolean = {
  type: "boolean"
  value: boolean | undefined
}
