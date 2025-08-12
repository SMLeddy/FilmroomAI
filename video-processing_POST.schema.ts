import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { GameFilms } from '../helpers/schema';

export const schema = z.object({
  filmId: z.number().int().positive(),
  status: z.string(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<GameFilms>;

export const postVideoProcessing = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/video-processing`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error?: string };
    throw new Error(errorObject.error || "Unknown error during video processing.");
  }
  return superjson.parse<OutputType>(await result.text());
};