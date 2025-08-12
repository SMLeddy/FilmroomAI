import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type Reports } from "../helpers/schema";
import { ReportStatusArrayValues, ReportFocusAreaArrayValues } from "../helpers/reportSchema";

export const schema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required.").optional(),
  focusArea: z.string().min(1, "Focus area is required").optional(),
  opponentName: z.string().min(1, "Opponent name is required.").optional(),
  gameIds: z.array(z.number()).min(1, "At least one game must be selected.").optional(),
  status: z.enum(ReportStatusArrayValues).optional(),
  aiAnalysis: z.any().optional(), // Using z.any() for JSON type
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Reports>;

export const postReportUpdate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/report-update`, {
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
    throw new Error((errorObject as any)?.error || "Failed to update report");
  }
  return superjson.parse<OutputType>(await result.text());
};