export function filterObject<T extends object>(
  input: T,
): {
  [P in keyof T as {} extends Pick<T, P> ? never : P]: T[P];
} {
  return Object.fromEntries(
    Object.entries(input).filter(([_, value]) => value !== undefined),
  ) as never;
}
