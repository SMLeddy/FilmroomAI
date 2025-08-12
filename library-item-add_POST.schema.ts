import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { LibraryItems } from '../helpers/schema';

export const schema = z.object({
  libraryId: z.number().int(),
  clipId: z.number().int().optional(),
  playId: z.number().int().optional(),
  notes: z.string().optional(),
}).refine(data => data.clipId || data.playId, {
  message: "Either clipId or playId must be provided.",
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<LibraryItems>;

export const postLibraryItemAdd = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/library-item-add`, {
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