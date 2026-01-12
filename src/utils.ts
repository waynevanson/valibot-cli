export function behead<T, U extends ReadonlyArray<unknown>>(
  input: readonly [T, ...U]
): { head: T; body: U } {
  return { head: input[0], body: input.slice(1) as never }
}

export function tuple<T extends ReadonlyArray<unknown>>(...inputs: T): T {
  return inputs
}
