import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { GameFilms } from '../helpers/schema';

export const schema = z.object({
  title: z.string().min(1, "Title is required"),
  opponent: z.string().min(1, "Opponent is required"),
  gameDate: z.date({ required_error: "Game date is required" }),
  homeTeam: z.string().min(1, "Home team is required"),
  awayTeam: z.string().min(1, "Away team is required"),
  analyzingTeam: z.string().min(1, "Team being analyzed is required"),
  videoDurationSeconds: z.number().positive("Video duration must be positive"),
  videoFileSize: z.number().positive("Video file size is required"),
  videoMimeType: z.string().min(1, "Video mime type is required"),
  fileKey: z.string().min(1, "File key is required"),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<GameFilms>;

export const postFilmCreate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/film-create`, {
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
    const errorMessage = errorObject?.error || errorObject?.message || errorObject?.Message || 'Failed to create film record';
    throw new Error(errorMessage);
  }

  return superjson.parse<OutputType>(await result.text());
};