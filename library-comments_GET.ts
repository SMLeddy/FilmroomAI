import { db } from "../helpers/db";
import { schema, OutputType } from "./library-comments_GET.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const libraryItemId = Number(url.searchParams.get('libraryItemId'));
    const input = schema.parse({ libraryItemId });

    // TODO: Add permission check.

    const comments = await db
      .selectFrom('libraryComments')
      .where('libraryItemId', '=', input.libraryItemId)
      .selectAll()
      .orderBy('createdAt', 'asc')
      .execute();

    return new Response(superjson.stringify(comments satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to fetch comments: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}