import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type Reports } from "../helpers/schema";

export const schema = z.object({
  reportId: z.number().int().positive(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Reports>;

export const postReportGenerateAnalysis = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/report-generate-analysis`, {
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
    throw new Error((errorObject as any)?.error || "Failed to generate report analysis");
  }
  return superjson.parse<OutputType>(await result.text());
};