import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  opponentName: string;
  gameCount: number;
  firstGameDate: Date;
  lastGameDate: Date;
}[];

export const getOpponents = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/opponents`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as any;
    throw new Error(errorObject.error || "Failed to fetch opponents");
  }
  return superjson.parse<OutputType>(await result.text());
};