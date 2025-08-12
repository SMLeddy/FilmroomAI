import { db } from "../helpers/db";
import { schema, OutputType } from "./report-update_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const { id, ...updateData } = schema.parse(json);

    if (Object.keys(updateData).length === 0) {
      return new Response(superjson.stringify({ error: "No update data provided." }), { status: 400 });
    }

    const updatedReport = await db
      .updateTable('reports')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!updatedReport) {
      return new Response(superjson.stringify({ error: `Report with ID ${id} not found.` }), { status: 404 });
    }

    return new Response(superjson.stringify(updatedReport satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error updating report:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}