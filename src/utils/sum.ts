export type Sum<T extends Record<string, unknown>> = { type: unknown } extends T
  ? {
      [P in keyof T]: { type: P } & T[P]
    }[keyof T]
  : never

export function foldSum<T extends Record<string, unknown>, U>(
  sum: Sum<T>,
  fold: { [P in keyof T]: (kind: T[P]) => U }
): U {
  return fold[sum.type](sum)
}
