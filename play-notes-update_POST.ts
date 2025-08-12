import { db } from "../helpers/db";
import { schema, OutputType, InputType } from "./play-notes-update_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const { playId, notes } = schema.parse(json);

    const updatedPlay = await db
      .updateTable('plays')
      .set({ notes })
      .where('id', '=', playId)
      .returningAll()
      .executeTakeFirst();

    if (!updatedPlay) {
      return new Response(superjson.stringify({ error: `Play with ID ${playId} not found.` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(superjson.stringify(updatedPlay satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error updating play notes:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to update play notes: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}