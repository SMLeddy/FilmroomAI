import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Libraries } from '../helpers/schema';

export const schema = z.object({
  libraryId: z.number().int(),
  title: z.string().min(1, "Title is required.").optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Libraries>;

export const postLibraryUpdate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/library-update`, {
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