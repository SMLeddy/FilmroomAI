import { db } from "../helpers/db";
import { schema, OutputType } from "./recent-activity_GET.schema";
import superjson from 'superjson';
import { sql } from 'kysely';
import { nanoid } from 'nanoid';

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const processedParams = {
      ...(queryParams.limit && { limit: parseInt(queryParams.limit, 10) })
    };
    const input = schema.parse(processedParams);
    const limit = input.limit ?? 10;

    const uploads = db
      .selectFrom('gameFilms')
      .select([
        'id as filmId',
        'title',
        'opponent',
        'uploadDate as timestamp',
        sql<string>`'film_upload'`.as('type')
      ])
      .where('uploadDate', 'is not', null);

    const analyses = db
      .selectFrom('gameFilms')
      .select([
        'id as filmId',
        'title',
        'opponent',
        'processedAt as timestamp',
        sql<string>`'analysis_complete'`.as('type')
      ])
      .where('processedAt', 'is not', null)
      .where('processingStatus', '=', 'completed');

    const combinedQuery = db
      .selectFrom(uploads.unionAll(analyses).as('activities'))
      .selectAll()
      .orderBy('timestamp', 'desc')
      .limit(limit);

    const activities = await combinedQuery.execute();

    const output: OutputType = activities
      .filter(activity => activity.timestamp !== null)
      .map(activity => ({
        id: nanoid(),
        timestamp: activity.timestamp as Date,
        type: activity.type as 'film_upload' | 'analysis_complete',
        details: {
          filmId: activity.filmId,
          title: activity.title,
          opponent: activity.opponent,
        }
      }));

    return new Response(superjson.stringify(output), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error fetching recent activity:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to fetch recent activity: ${errorMessage}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}