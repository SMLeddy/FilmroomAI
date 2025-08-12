import { db } from "../helpers/db";
import { OutputType } from "./film-upload_POST.schema";
import superjson from 'superjson';
import { z } from 'zod';

// Server-side validation schema. File is handled separately.
const serverSchema = z.object({
  title: z.string(),
  opponent: z.string(),
  gameDate: z.string().datetime(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  analyzingTeam: z.string(),
  videoDurationSeconds: z.string().transform(Number),
});

export async function handle(request: Request) {
  try {
    const formData = await request.formData();
    
    const videoFile = formData.get('videoFile');
    if (!(videoFile instanceof File)) {
      throw new Error("Video file is missing or invalid.");
    }

    const rawData = {
      title: formData.get('title'),
      opponent: formData.get('opponent'),
      gameDate: formData.get('gameDate'),
      homeTeam: formData.get('homeTeam'),
      awayTeam: formData.get('awayTeam'),
      analyzingTeam: formData.get('analyzingTeam'),
      videoDurationSeconds: formData.get('videoDurationSeconds'),
    };

    const validatedData = serverSchema.parse(rawData);

    const fileBuffer = await videoFile.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString('base64');

    const newFilm = await db
      .insertInto('gameFilms')
      .values({
        title: validatedData.title,
        opponent: validatedData.opponent,
        gameDate: new Date(validatedData.gameDate),
        homeTeam: validatedData.homeTeam,
        awayTeam: validatedData.awayTeam,
        analyzingTeam: validatedData.analyzingTeam,
        videoDurationSeconds: validatedData.videoDurationSeconds,
        videoFileData: base64Data,
        videoFileSize: videoFile.size,
        videoMimeType: videoFile.type,
        uploadDate: new Date(),
        processingStatus: 'processed',
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(newFilm satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
      status: 201,
    });

  } catch (error) {
    console.error("Error uploading game film:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to upload film: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}