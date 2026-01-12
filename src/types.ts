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
