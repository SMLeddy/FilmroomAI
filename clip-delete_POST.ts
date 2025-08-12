import { db } from "../helpers/db";
import { schema, InputType, OutputType } from "./clip-delete_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const json = superjson.parse<InputType>(await request.text());
    const { id } = schema.parse(json);

    const result = await db
      .deleteFrom('clips')
      .where('id', '=', id)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      return new Response(superjson.stringify({ error: "Clip not found or already deleted." }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(superjson.stringify({ success: true } satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error deleting clip:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to delete clip: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}