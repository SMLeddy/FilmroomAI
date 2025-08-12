import { db } from "../helpers/db";
import { schema, OutputType } from "./library-item-remove_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // TODO: Add permission check (editor or owner).

    await db
      .deleteFrom('libraryItems')
      .where('id', '=', input.libraryItemId)
      .where('libraryId', '=', input.libraryId)
      .execute();

    return new Response(superjson.stringify({ success: true } satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error removing item from library:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to remove item: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}