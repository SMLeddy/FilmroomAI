import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Plays } from '../helpers/schema';
import { DownTypeArrayValues, PlayResultTypeArrayValues } from '../helpers/schema';

export const schema = z.object({
  filmId: z.number().int().positive().optional(),
  opponent: z.string().optional(),
  down: z.enum(DownTypeArrayValues).optional(),
  playResult: z.enum(PlayResultTypeArrayValues).optional(),
  formation: z.string().optional(),
}).refine(
  (data) => data.filmId !== undefined || data.opponent !== undefined,
  {
    message: "Either filmId or opponent must be provided",
    path: ["filmId", "opponent"],
  }
);

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Plays>[];

export const getPlays = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedParams = schema.parse(params);
  const searchParams = new URLSearchParams();

  Object.entries(validatedParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const result = await fetch(`/_api/plays?${searchParams.toString()}`, {
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