import { z } from "zod";

export const createCategoresSchema = z.object({
  name: z.string().min(3).max(20),
  icon: z.string().max(20),
  type: z.enum(["income", "expense"]),
});

export type createCategoresSchemaType = z.infer<typeof createCategoresSchema>;

export const deleteCategorySchema = z.object({
  name: z.string().min(3).max(20),
  type: z.enum(["income", "expense"]),
});

export type deleteCategorySchemaType = z.infer<typeof deleteCategorySchema>;
