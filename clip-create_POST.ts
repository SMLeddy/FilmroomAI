import { db } from "../helpers/db";
import { schema, InputType, OutputType } from "./clip-create_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const json = superjson.parse<InputType>(await request.text());
    const input = schema.parse(json);

    const newClip = await db
      .insertInto('clips')
      .values({
        ...input,
        createdAt: new Date(),
        durationSeconds: String(input.endTimeSeconds - input.startTimeSeconds),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(newClip satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error creating clip:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to create clip: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}