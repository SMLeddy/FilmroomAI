import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type Reports } from "../helpers/schema";
import { ReportFocusAreaArrayValues } from "../helpers/reportSchema";

export const schema = z.object({
  title: z.string().min(1, "Title is required."),
  focusArea: z.string().min(1, "Focus area is required"),
  opponentName: z.string().min(1, "Opponent name is required."),
  gameIds: z.array(z.number()).min(1, "At least one game must be selected."),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Reports>;

export const postReportCreate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/report-create`, {
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
    throw new Error((errorObject as any)?.error || "Failed to create report");
  }
  return superjson.parse<OutputType>(await result.text());
};