import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { GameFilms } from '../helpers/schema';

// Extended film type with streaming URL information
export type FilmWithStreaming = Omit<Selectable<GameFilms>, 'videoFileData'> & {
  streamingUrl: string | null;
  hasStreamingUrl: boolean;
  streamingError?: string;
  // videoFileData is excluded for S3 films to optimize payload size
  videoFileData?: string | null;
};

export const schema = z.object({
  opponent: z.string().optional(),
  teamAnalyzed: z.string().optional(),
  filmId: z.number().int().positive().optional(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = FilmWithStreaming[];

export const getFilms = async (params?: InputType, init?: RequestInit): Promise<OutputType> => {
  const searchParams = new URLSearchParams();
  
  if (params) {
    const validatedParams = schema.parse(params);
    Object.entries(validatedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/_api/films?${queryString}` : '/_api/films';

  const result = await fetch(url, {
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