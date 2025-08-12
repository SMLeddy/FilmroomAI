import { db } from "../helpers/db";
import { OutputType } from "./opponents_GET.schema";
import superjson from 'superjson';
import { sql } from 'kysely';

export async function handle(request: Request) {
  try {
    const opponentsData = await db
      .selectFrom('gameFilms')
      .select([
        'opponent',
        sql<number>`count(id)::int`.as('gameCount'),
        sql<Date>`min(game_date)`.as('firstGameDate'),
        sql<Date>`max(game_date)`.as('lastGameDate'),
      ])
      .where('opponent', 'is not', null)
      .where('opponent', '!=', '')
      .groupBy('opponent')
      .orderBy('opponent', 'asc')
      .execute();

    const output: OutputType = opponentsData.map(item => ({
      opponentName: item.opponent,
      gameCount: item.gameCount,
      firstGameDate: item.firstGameDate,
      lastGameDate: item.lastGameDate,
    }));

    return new Response(superjson.stringify(output), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching opponents:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to fetch opponents: ${errorMessage}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}