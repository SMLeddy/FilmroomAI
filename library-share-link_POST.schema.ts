import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';

// This assumes a `LibraryShareLinks` table exists.
// A placeholder type is created here.
export interface LibraryShareLinks {
  id: number;
  libraryId: number;
  shareId: string;
  createdAt: Date;
  expiresAt: Date | null;
  accessCount: number;
  passwordHash: string | null;
  createdBy: string;
}

export const schema = z.object({
  libraryId: z.number().int(),
  expiresAt: z.date().optional().nullable(),
  password: z.string().optional().nullable(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<LibraryShareLinks>;

export const postLibraryShareLink = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/library-share-link`, {
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