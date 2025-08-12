import { db } from "../helpers/db";
import { schema, InputType, OutputType } from "./clip-update_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const json = superjson.parse<InputType>(await request.text());
    const { id, ...updateData } = schema.parse(json);

    // Don't manually set durationSeconds as it's a generated column
    const updatedClip = await db
      .updateTable('clips')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(updatedClip satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error updating clip:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to update clip: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}