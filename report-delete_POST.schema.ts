import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  id: z.number(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = { success: boolean };

export const postReportDelete = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/report-delete`, {
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
    throw new Error((errorObject as any)?.error || "Failed to delete report");
  }
  return superjson.parse<OutputType>(await result.text());
};