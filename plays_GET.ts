import { db } from "../helpers/db";
import { schema, OutputType } from "./plays_GET.schema";
import superjson from 'superjson';
import { Kysely } from "kysely";
import { DB } from "../helpers/schema";

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    // Coerce numeric types from string
    const transformedParams = {
      ...queryParams,
      filmId: queryParams.filmId ? Number(queryParams.filmId) : undefined,
    };

    const input = schema.parse(transformedParams);

    let query = db.selectFrom('plays');

    // Handle opponent-based filtering (across multiple games) vs single film filtering
    if (input.opponent) {
      // Join with gameFilms to filter by opponent across multiple games
      query = query
        .innerJoin('gameFilms', 'plays.filmId', 'gameFilms.id')
        .where('gameFilms.opponent', '=', input.opponent);
    } else if (input.filmId) {
      // Single film filtering
      query = query.where('filmId', '=', input.filmId);
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

    const plays = await query
      .select([
        'plays.id',
        'plays.filmId',
        'plays.playNumber',
        'plays.quarter',
        'plays.timeInGame',
        'plays.down',
        'plays.distance',
        'plays.yardLine',
        'plays.formation',
        'plays.playCall',
        'plays.playResult',
        'plays.yardsGained',
        'plays.notes',
        'plays.videoTimestampStart',
        'plays.videoTimestampEnd',
        'plays.createdAt'
      ])
      .orderBy('plays.playNumber', 'asc')
      .execute();

    return new Response(superjson.stringify(plays satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching plays:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to fetch plays: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}