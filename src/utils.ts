export function behead<T, U extends ReadonlyArray<unknown>>(
  input: readonly [T, ...U],
): { head: T; body: U } {
  return { head: input[0], body: input.slice(1) as never }
}
