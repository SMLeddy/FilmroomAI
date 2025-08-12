import { db } from "../helpers/db";
import { schema, OutputType } from "./library-item-add_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // TODO: Add permission check (editor or owner).
    const userEmail = 'coach.a@example.com';

    const newItem = await db
      .insertInto('libraryItems')
      .values({
        libraryId: input.libraryId,
        clipId: input.clipId,
        playId: input.playId,
        notes: input.notes,
        addedBy: userEmail,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(newItem satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error adding item to library:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to add item: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}