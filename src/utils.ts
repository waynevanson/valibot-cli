export function behead<T, U extends ReadonlyArray<unknown>>(
  input: readonly [T, ...U]
): { head: T; body: U } {
  return { head: input[0], body: input.slice(1) as never }
}

export function tuple<T extends ReadonlyArray<unknown>>(...inputs: T): T {
  return inputs
}

export function filterObject<T extends object>(
  input: T
): {
  [P in keyof T as {} extends Pick<T, P> ? never : P]: T[P]
} {
  return Object.fromEntries(
    Object.entries(input).filter(([_, value]) => value !== undefined)
  ) as never
}
