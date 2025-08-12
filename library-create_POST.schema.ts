import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Libraries } from '../helpers/schema';
import { LibraryTypeArrayValues } from '../helpers/schema';

export const schema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  libraryType: z.enum(LibraryTypeArrayValues),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<Libraries>;

export const postLibraryCreate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/library-create`, {
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