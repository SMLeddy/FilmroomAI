import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { LibraryComments } from '../helpers/schema';

export const schema = z.object({
  libraryItemId: z.number().int(),
  content: z.string().min(1, "Comment cannot be empty."),
  parentCommentId: z.number().int().optional(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<LibraryComments>;

export const postLibraryCommentCreate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/library-comment-create`, {
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