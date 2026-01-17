export function behead<T, U extends ReadonlyArray<unknown>>(
  input: readonly [T, ...U]
): { head: T; body: U } {
  return { head: input[0], body: input.slice(1) as never }
}

export function tuple<T extends ReadonlyArray<unknown>>(...inputs: T): T {
  return inputs
}

export function findExactlyOne<T, F extends (value: T) => boolean>(
  array: Array<T>,
  predicate: F
): T | undefined {
  let multiple = false
  let value: undefined | T = undefined
  for (const item of array) {
    if (predicate(item)) {
      if (value !== undefined) {
        multiple = true
      }
      value = item
    }
  }

  if (multiple) {
    throw new Error()
  }

  return value
}

export function zip<T extends Array<unknown>, U extends Array<unknown>>(
  left: T,
  right: U
): Array<[T[number], U[number]]> {
  if (left.length !== right.length) {
    throw new Error()
  }

  return Array.from(
    { length: left.length },
    (_, index) => [left[index], right[index]] as const
  )
}

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

export type MaybeReadonly<T> = T | Readonly<T>
