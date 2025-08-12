import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  opponentName: z.string({ required_error: "opponentName is required" }).min(1),
});

export type InputType = z.infer<typeof schema>;

type CountStat = {
  name: string;
  count: number;
};

export type OutputType = {
  overview: {
    opponentName: string;
    totalGames: number;
    totalPlays: number;
  };
  formationUsage: {
    formation: string;
    down: string;
    count: number;
  }[];
  playCallTendencies: CountStat[];
  redZonePatterns: {
    totalPlays: number;
    touchdownRate: number;
    fieldGoalRate: number;
    turnoverRate: number;
    topPlayCalls: CountStat[];
  };
  thirdDownSuccessRates: {
    totalAttempts: number;
    conversions: number;
    successRate: number;
    topPlayCalls: CountStat[];
  };
  personnelPackageUsage: CountStat[];
};

export const getOpponentAnalytics = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedParams = schema.parse(params);
  const searchParams = new URLSearchParams({
    opponentName: validatedParams.opponentName,
  });

  const result = await fetch(`/_api/opponent-analytics?${searchParams.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as any;
    throw new Error(errorObject.error || "Failed to fetch opponent analytics");
  }
  return superjson.parse<OutputType>(await result.text());
};