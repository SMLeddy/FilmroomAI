import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type ReportSections } from "../helpers/schema";
import { ReportSectionTypeArrayValues } from "../helpers/reportSchema";

export const schema = z.object({
  reportId: z.number().int().positive(),
  title: z.string().min(1, "Title is required."),
  sectionType: z.enum(ReportSectionTypeArrayValues),
  content: z.any().optional(), // JSON content
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<ReportSections>;

export const postReportSectionCreate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/report-section-create`, {
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
    throw new Error((errorObject as any)?.error || "Failed to create report section");
  }
  return superjson.parse<OutputType>(await result.text());
};