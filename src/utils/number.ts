export interface Bound extends Record<"min" | "max", number> {}

export function isBoundInRange(input: Bound, bound: Bound | number) {
  if (typeof bound === "number") {
    return input.min === bound || input.max === bound;
  } else {
    return input.min >= bound.min && input.max <= bound.max;
  }
}
