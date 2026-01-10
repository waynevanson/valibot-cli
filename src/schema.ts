import type { BaseIssue, BaseSchema, ObjectEntries } from "valibot"
import * as v from "valibot"

export function objectWithoutUndefined<const TEntries$1 extends ObjectEntries>(
  entries: TEntries$1,
) {
  return objectWithoutRest(entries, v.undefined())
}

export function objectWithoutRest<
  const TEntries$1 extends ObjectEntries,
  const TRest$1 extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(entries: TEntries$1, rest: TRest$1) {
  return v.pipe(v.objectWithRest(entries, rest), v.object(entries))
}
