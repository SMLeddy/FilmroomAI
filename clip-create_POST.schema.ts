import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Clips } from '../helpers/schema';
import { DownTypeArrayValues, PlayResultTypeArrayValues } from '../helpers/schema';

export const schema = z.object({
  filmId: z.number().int().positive(),
  title: z.string(),
  description: z.string().optional().nullable(),
  startTimeSeconds: z.number(),
  endTimeSeconds: z.number(),
  down: z.enum(DownTypeArrayValues).optional().nullable(),
  distance: z.number().optional().nullable(),
  yardLine: z.number().optional().nullable(),
  formation: z.string().optional().nullable(),
  playCall: z.string().optional().nullable(),
  playResult: z.enum(PlayResultTypeArrayValues).optional().nullable(),
  yardsGained: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  quarter: z.number().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Clips>;

export const createClip = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/clip-create`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
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