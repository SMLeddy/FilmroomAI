import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { LibraryCollaborators } from '../helpers/schema';

export const schema = z.object({
  libraryId: z.number().int(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<LibraryCollaborators>[];

export const getLibraryCollaborators = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedParams = schema.parse(params);
  const searchParams = new URLSearchParams({ libraryId: String(validatedParams.libraryId) });

  const result = await fetch(`/_api/library-collaborators?${searchParams.toString()}`, {
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