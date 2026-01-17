import * as v from "valibot"
import { MaybeReadonly } from "./"

export const UnknownPathItem = v.strictObject({
  type: v.literal("unknown"),
  origin: v.picklist(["key", "value"]),
  input: v.unknown(),
  key: v.unknown(),
  value: v.unknown()
})

export const ArrayPathItem = v.strictObject({
  type: v.literal("array"),
  origin: v.literal("value"),
  input: v.array(v.unknown()),
  key: v.number(),
  value: v.unknown()
})

export const MapPathItem = v.strictObject({
  type: v.literal("map"),
  origin: v.picklist(["key", "value"]),
  input: v.map(v.unknown(), v.unknown()),
  key: v.unknown(),
  value: v.unknown()
})

export const ObjectPathItem = v.strictObject({
  type: v.literal("object"),
  origin: v.picklist(["key", "value"]),
  input: v.record(v.string(), v.unknown()),
  key: v.string(),
  value: v.unknown()
})

export const SetPathItem = v.strictObject({
  type: v.literal("set"),
  origin: v.literal("value"),
  input: v.set(v.unknown()),
  key: v.null(),
  value: v.unknown()
})

export const IssuePathItem = v.variant("type", [
  ArrayPathItem,
  MapPathItem,
  ObjectPathItem,
  SetPathItem,
  UnknownPathItem
])

export function BaseIssue<Input>(input: v.GenericSchema<Input>) {
  const issue: v.GenericSchema<v.GenericIssue<Input>> = v.lazy(() =>
    BaseIssue(input)
  )

  return v.strictObject({
    kind: v.picklist(["schema", "validation", "transformation"]),
    type: v.string(),
    input,
    expected: v.nullable(v.string()),
    received: v.string(),
    message: v.string(),
    requirement: v.optional(v.unknown()),
    path: v.optional(v.tupleWithRest([IssuePathItem], IssuePathItem)),
    issues: v.optional(v.tupleWithRest([issue], issue))
  }) satisfies v.GenericSchema<v.GenericIssue<Input>>
}

export function BaseSchema<Input, Output>() {
  return v.object({
    kind: v.literal("schema"),
    type: v.string(),
    reference: v.any(),
    expects: v.string(),
    async: v.literal(false),
    "~standard": v.any(),
    "~run": v.any()
  }) satisfies v.GenericSchema<v.BaseSchema<Input, Output, v.BaseIssue<Input>>>
}

export function StringSchema() {
  return v.looseObject({
    type: v.literal("string"),
    expects: v.literal("string"),
    message: v.any(),
    kind: v.literal("schema"),
    async: v.literal(false),
    reference: v.any(),
    "~standard": v.any(),
    "~run": v.any()
  }) satisfies v.GenericSchema<
    v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
  >
}
export function MetadataSchema<ObjectEntries extends v.ObjectEntries>(
  metadata: v.ObjectSchema<
    ObjectEntries,
    v.ErrorMessage<v.ObjectIssue> | undefined
  >
) {
  return v.looseObject({
    kind: v.literal("metadata"),
    type: v.literal("metadata"),
    metadata,
    reference: v.any()
  }) satisfies v.GenericSchema<
    v.MetadataAction<
      unknown,
      { [P in keyof ObjectEntries]: v.InferInput<ObjectEntries[P]> }
    >
  >
}

export function StrictTuple<
  TupleItems extends MaybeReadonly<Array<v.GenericSchema<v.GenericSchema>>>
>(items: TupleItems) {
  return v.pipe(
    v.looseObject({
      kind: v.literal("schema"),
      type: v.literal("strict_tuple"),
      expects: v.literal("Array"),
      message: v.any(),
      async: v.literal(false),
      reference: v.any(),
      "~standard": v.any(),
      "~run": v.any(),
      items: v.strictTuple(items)
    })
  ) satisfies v.GenericSchema<
    v.StrictTupleSchema<
      { [P in keyof TupleItems]: v.InferInput<TupleItems[P]> },
      v.ErrorMessage<v.StrictTupleIssue> | undefined
    >
  >
}

export function SchemaWithPipe<
  Pipe extends readonly [
    v.GenericSchema<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>,
    ...v.GenericSchema<v.PipeItem<any, unknown, v.BaseIssue<unknown>>>[]
  ]
>(...pipe: Pipe) {
  return v.intersect([
    v.strictObject({
      pipe: v.strictTuple(pipe)
    }),
    pipe[0]
  ])
}
