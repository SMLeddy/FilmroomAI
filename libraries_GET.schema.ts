import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Libraries } from '../helpers/schema';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Libraries>[];

export const getLibraries = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/libraries`, {
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