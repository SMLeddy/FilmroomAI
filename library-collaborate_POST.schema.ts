import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { LibraryCollaborators } from '../helpers/schema';
import { CollaborationRoleArrayValues } from '../helpers/schema';

export const schema = z.object({
  libraryId: z.number().int(),
  collaboratorEmail: z.string().email(),
  role: z.enum(CollaborationRoleArrayValues),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<LibraryCollaborators>;

export const postLibraryCollaborate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/library-collaborate`, {
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