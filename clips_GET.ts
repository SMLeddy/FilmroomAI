import { db } from "../helpers/db";
import { schema, OutputType } from "./clips_GET.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const transformedParams = {
      ...queryParams,
      filmId: queryParams.filmId ? Number(queryParams.filmId) : undefined,
    };

    const input = schema.parse(transformedParams);

    let query = db.selectFrom('clips');

    if (input.filmId) {
      query = query.where('filmId', '=', input.filmId);
    } else {
      // In the future, this could be extended to filter by tags, etc. across all films
      // For now, we require a filmId to scope the clips.
      throw new Error("filmId is required to fetch clips");
    }

    // Add other filters from schema if they exist
    if (input.down) {
      query = query.where('down', '=', input.down);
    }
    if (input.playResult) {
      query = query.where('playResult', '=', input.playResult);
    }
    if (input.formation) {
      query = query.where('formation', '=', input.formation);
    }

    const clips = await query
      .selectAll()
      .orderBy('id', 'asc')
      .execute();

    return new Response(superjson.stringify(clips satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching clips:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to fetch clips: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}