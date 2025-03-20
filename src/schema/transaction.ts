import z from "zod";

const CreateTransactionSchema = z.object({
  amount: z.coerce.number().positive().multipleOf(0.01),
  description: z.string().optional(),
  date: z.coerce.date(),
  category: z.string(),
  type: z.union([z.literal("income"), z.literal("expense")]),
});

type CreateTransactionSchemaType = z.infer<typeof CreateTransactionSchema>;

export { CreateTransactionSchema };
export type { CreateTransactionSchemaType };
