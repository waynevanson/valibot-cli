export function filterObject<T extends object>(
  input: T,
): {
  // biome-ignore lint/suspicious/noExplicitAny: <it's keyof any chill>
  [P in keyof T as Record<keyof any, never> extends Pick<T, P>
    ? never
    : P]: T[P];
} {
  return Object.fromEntries(
    Object.entries(input).filter(([_, value]) => value !== undefined),
  ) as never;
}
