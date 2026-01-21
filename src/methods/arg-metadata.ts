import * as v from "valibot";

const name = v.pipe(v.string(), v.minLength(1));

export const ArgValueMetadata = v.object({
  type: v.literal("value"),
  name,
});

export type ArgValueMetadata = v.InferOutput<typeof ArgValueMetadata>;

const longs = v.pipe(v.array(name));
const char = v.pipe(v.string(), v.minLength(1), v.maxLength(1));
const shorts = v.pipe(v.array(char));

export const ArgOptionMetadata = v.object({
  type: v.literal("option"),
  name,
  shorts,
  longs,
});

export type ArgOptionMetadata = v.InferOutput<typeof ArgOptionMetadata>;

export const ArgSubcommandMetadata = v.strictObject({
  type: v.literal("subcommand"),
  name,
});

export type ArgSubcommandMetadata = v.InferOutput<typeof ArgSubcommandMetadata>;

export const ArgMetadata = v.variant("type", [
  ArgValueMetadata,
  ArgOptionMetadata,
  ArgSubcommandMetadata,
]);

export type ArgMetadata = v.InferOutput<typeof ArgMetadata>;
