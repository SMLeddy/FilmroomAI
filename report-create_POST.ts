import { db } from "../helpers/db";
import { schema, OutputType } from "./report-create_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const newReport = await db
      .insertInto('reports')
      .values({
        title: input.title,
        focusArea: input.focusArea,
        opponentName: input.opponentName,
        gameIds: input.gameIds,
        status: 'draft', // Default status on creation
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(newReport satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
      status: 201,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}