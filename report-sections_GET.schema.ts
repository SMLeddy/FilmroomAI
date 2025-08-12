import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type ReportSections } from "../helpers/schema";

export const schema = z.object({
  reportId: z.number().int().positive("Report ID must be a positive integer."),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<ReportSections>[];

export const getReportSections = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedParams = schema.parse(params);
  const queryParams = new URLSearchParams({
    reportId: validatedParams.reportId.toString(),
  });
  
  const url = `/_api/report-sections?${queryParams.toString()}`;

  const result = await fetch(url, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text());
    throw new Error((errorObject as any)?.error || "Failed to fetch report sections");
  }
  return superjson.parse<OutputType>(await result.text());
};