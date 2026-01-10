import type { CheckAction } from "valibot"
import * as v from "valibot"
import { ArgMetadata } from "./types"

export const INTERNAL = Symbol("INTERNAL")
export type INTERNAL = typeof INTERNAL

export interface ArgAction<T> extends CheckAction<unknown, undefined> {
  [INTERNAL]: T
}

export function arg<TArgMetadata extends ArgMetadata>(
  internal: TArgMetadata,
): ArgAction<TArgMetadata> {
  return Object.assign(
    v.check(() => true),
    { [INTERNAL]: internal },
  )
}
