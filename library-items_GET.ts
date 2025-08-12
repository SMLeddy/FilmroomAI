import { db } from "../helpers/db";
import { schema, OutputType } from "./library-items_GET.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const libraryId = Number(url.searchParams.get('libraryId'));
    const input = schema.parse({ libraryId });

    // TODO: Add permission check.

    const items = await db
      .selectFrom('libraryItems')
      .where('libraryId', '=', input.libraryId)
      .leftJoin('clips', 'libraryItems.clipId', 'clips.id')
      .leftJoin('plays', 'libraryItems.playId', 'plays.id')
      .select([
        'libraryItems.id', 'libraryItems.notes', 'libraryItems.sortOrder',
        'clips.id as clipId', 'clips.title as clipTitle', 'clips.playCall as clipPlayCall',
        'plays.id as playId', 'plays.playCall as playPlayCall', 'plays.formation as playFormation'
      ])
      .orderBy('libraryItems.sortOrder', 'asc')
      .orderBy('libraryItems.addedAt', 'asc')
      .execute();

    return new Response(superjson.stringify(items satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching library items:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to fetch library items: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}