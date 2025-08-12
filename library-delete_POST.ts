import { db } from "../helpers/db";
import { schema, OutputType } from "./library-delete_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // TODO: Add permission check to ensure user is owner.

    await db.deleteFrom('libraries').where('id', '=', input.libraryId).execute();

    return new Response(superjson.stringify({ success: true } satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error deleting library:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to delete library: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}