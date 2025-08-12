import { db } from "../helpers/db";
import { schema, OutputType } from "./library-collaborators_GET.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const libraryId = Number(url.searchParams.get('libraryId'));
    const input = schema.parse({ libraryId });

    // TODO: Add permission check.

    const collaborators = await db
      .selectFrom('libraryCollaborators')
      .where('libraryId', '=', input.libraryId)
      .selectAll()
      .execute();

    return new Response(superjson.stringify(collaborators satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to fetch collaborators: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}