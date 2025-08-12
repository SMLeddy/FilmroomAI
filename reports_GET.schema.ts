import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type Reports } from "../helpers/schema";
import { ReportStatusArrayValues } from "../helpers/reportSchema";

export const schema = z.object({
  id: z.number().optional(),
  status: z.enum(ReportStatusArrayValues).optional(),
  focusArea: z.string().optional(),
  opponentName: z.string().optional(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Reports>[];

export const getReports = async (params?: InputType, init?: RequestInit): Promise<OutputType> => {
  const queryParams = new URLSearchParams();
  if (params?.id) queryParams.set('id', params.id.toString());
  if (params?.status) queryParams.set('status', params.status);
  if (params?.focusArea) queryParams.set('focusArea', params.focusArea);
  if (params?.opponentName) queryParams.set('opponentName', params.opponentName);
  
  const url = `/_api/reports?${queryParams.toString()}`;

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
    throw new Error((errorObject as any)?.error || "Failed to fetch reports");
  }
  return superjson.parse<OutputType>(await result.text());
};