import { db } from "../helpers/db";
import { schema, OutputType } from "./video-processing_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const { filmId, status } = schema.parse(json);

    const updatedFilm = await db
      .updateTable('gameFilms')
      .set({ 
        processingStatus: status,
        processedAt: new Date(),
      })
      .where('id', '=', filmId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(updatedFilm satisfies OutputType));
  } catch (error) {
    console.error("Error processing video:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to process video: ${errorMessage}` }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}