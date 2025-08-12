import { db } from "../helpers/db";
import { schema, OutputType } from "./analytics_GET.schema";
import superjson from 'superjson';
import { sql } from 'kysely';

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const transformedParams = {
      ...queryParams,
      filmId: queryParams.filmId ? Number(queryParams.filmId) : undefined,
    };

    const input = schema.parse(transformedParams);

    let query = db
      .selectFrom('plays')
      .select([
        'plays.playCall',
        sql<number>`count(*)::int`.as('count')
      ])
      .where('plays.playCall', 'is not', null);

    // Handle opponent-based filtering (across multiple games) vs single film filtering
    if (input.opponent) {
      // Join with gameFilms to filter by opponent across multiple games
      query = query
        .innerJoin('gameFilms', 'plays.filmId', 'gameFilms.id')
        .where('gameFilms.opponent', '=', input.opponent);
    } else if (input.filmId) {
      // Single film filtering
      query = query.where('plays.filmId', '=', input.filmId);
    } else {
      throw new Error("Either filmId or opponent must be provided");
    }

    if (input.down) {
      query = query.where('plays.down', '=', input.down);
    }
    if (input.playResult) {
      query = query.where('plays.playResult', '=', input.playResult);
    }
    if (input.formation) {
      query = query.where('plays.formation', '=', input.formation);
    }

    const rawData = await query
      .groupBy('plays.playCall')
      .orderBy('count', 'desc')
      .execute();

    // Transform the data to match OutputType by filtering out null playCall values
    // and ensuring count is a number
    const analyticsData = rawData
      .filter((item): item is { playCall: string; count: number } => 
        item.playCall !== null
      )
      .map(item => ({
        playCall: item.playCall,
        count: typeof item.count === 'string' ? parseInt(item.count, 10) : item.count
      }));

    return new Response(superjson.stringify(analyticsData satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to fetch analytics: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}