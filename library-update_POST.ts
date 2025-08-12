import { db } from "../helpers/db";
import { schema, OutputType } from "./library-update_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);
    
    // TODO: Add permission check to ensure user can edit this library.

    const { libraryId, ...updateData } = input;

    const updatedLibrary = await db
      .updateTable('libraries')
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where('id', '=', libraryId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(updatedLibrary satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error updating library:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to update library: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}