import z from "zod";

export const Resolver = z.object({
  path: z.string().or(z.number()).array(),
  parentType: z.string(),
  fieldName: z.string(),
  returnType: z.string(),
  startOffset: z.number(),
  duration: z.number().nonnegative(),
});

export const Block = z.object({
  startOffset: z.number(),
  duration: z.number().nonnegative(),
});

export const TracingPayload = z.object({
  version: z.number().optional(),
  startTime: z
    .string()
    .refine(s => !!Date.parse(s))
    .optional(),
  endTime: z
    .string()
    .refine(s => !!Date.parse(s))
    .optional(),
  parsing: Block.optional(),
  validation: Block.optional(),
  duration: z.number().nonnegative(),
  execution: z.object({
    resolvers: Resolver.array(),
  }),
});
