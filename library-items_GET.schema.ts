import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  libraryId: z.number().int(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  id: number;
  notes: string | null;
  sortOrder: number | null;
  clipId: number | null;
  clipTitle: string | null;
  clipPlayCall: string | null;
  playId: number | null;
  playPlayCall: string | null;
  playFormation: string | null;
}[];

export const getLibraryItems = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedParams = schema.parse(params);
  const searchParams = new URLSearchParams({ libraryId: String(validatedParams.libraryId) });

  const result = await fetch(`/_api/library-items?${searchParams.toString()}`, {
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