import { z } from "zod";
import superjson from 'superjson';

const sectionOrderSchema = z.object({
  id: z.number().int().positive(),
  orderIndex: z.number().int().min(0),
});

export const schema = z.object({
  reportId: z.number().int().positive(),
  sections: z.array(sectionOrderSchema).min(1, "At least one section must be provided for reordering."),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = { success: boolean };

export const postReportSectionsReorder = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/report-sections-reorder`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text());
    throw new Error((errorObject as any)?.error || "Failed to reorder report sections");
  }
  return superjson.parse<OutputType>(await result.text());
};