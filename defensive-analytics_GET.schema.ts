import { z } from "zod";
import superjson from 'superjson';
import { DownTypeArrayValues } from '../helpers/schema';

export const schema = z.object({
  filmId: z.number().int().positive().optional(),
  opponent: z.string().optional(),
  down: z.enum(DownTypeArrayValues).optional(),
  distance: z.object({
    gte: z.number().min(0).optional(),
    lte: z.number().min(0).optional(),
  }).optional(),
  formation: z.string().optional(),
  fieldPosition: z.enum(['redZone', 'midfield', 'backedUp']).optional(),
}).refine(
  (data) => data.filmId !== undefined || data.opponent !== undefined,
  {
    message: "Either filmId or opponent must be provided",
    path: ["filmId", "opponent"],
  }
);

export type InputType = z.infer<typeof schema>;

type CountStat = {
  name: string;
  count: number;
};

type SituationalStat = {
  name: string;
  down: string;
  count: number;
};

export type OutputType = {
  defensiveFrontUsage: SituationalStat[];
  personnelPackages: SituationalStat[];
  coverageTendencies: CountStat[];
  blitzPatterns: {
    totalPlays: number;
    blitzRate: number;
    topBlitzTypes: CountStat[];
  };
};

export const getDefensiveAnalytics = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedParams = schema.parse(params);
  const searchParams = new URLSearchParams();

  Object.entries(validatedParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'distance' && typeof value === 'object') {
        const distanceObj = value as { gte?: number; lte?: number };
        if (distanceObj.gte !== undefined) searchParams.append('distance[gte]', String(distanceObj.gte));
        if (distanceObj.lte !== undefined) searchParams.append('distance[lte]', String(distanceObj.lte));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const result = await fetch(`/_api/defensive-analytics?${searchParams.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as any;
    throw new Error(errorObject.error || 'Failed to fetch defensive analytics');
  }
  return superjson.parse<OutputType>(await result.text());
};