import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Plays } from '../helpers/schema';

export const schema = z.object({
  playId: z.number().int().positive(),
  notes: z.string().max(5000, "Notes cannot exceed 5000 characters.").nullable(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Plays>;

export const postPlayNotesUpdate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/play-notes-update`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error: string };
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};