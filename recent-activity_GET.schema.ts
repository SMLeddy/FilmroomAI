import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  limit: z.number().int().positive().optional(),
});

export type InputType = z.infer<typeof schema>;

const ActivityDetailsSchema = z.object({
  filmId: z.number(),
  title: z.string(),
  opponent: z.string(),
});

const ActivitySchema = z.object({
  id: z.string(),
  timestamp: z.date(),
}).and(
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal("film_upload"),
      details: ActivityDetailsSchema,
    }),
    z.object({
      type: z.literal("analysis_complete"),
      details: ActivityDetailsSchema,
    }),
  ])
);

export type OutputType = z.infer<typeof ActivitySchema>[];

export const getRecentActivity = async (params?: InputType, init?: RequestInit): Promise<OutputType> => {
  const searchParams = new URLSearchParams();
  
  if (params) {
    const validatedParams = schema.parse(params);
    if (validatedParams.limit !== undefined) {
      searchParams.append('limit', String(validatedParams.limit));
    }
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/_api/recent-activity?${queryString}` : '/_api/recent-activity';

  const result = await fetch(url, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as any;
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};