import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  libraryId: z.number().int(),
  libraryItemId: z.number().int(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = { success: boolean };

export const postLibraryItemRemove = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/library-item-remove`, {
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