import { db } from "../helpers/db";
import { schema, OutputType } from "./film-create_POST.schema";
import { getPublicUrl } from "../helpers/gcsServerUtils";
import superjson from 'superjson';


export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const validatedData = schema.parse(json);

    let filmUrl: string | null = null;
    let videoFileData: string | null = null;

    // Check if fileKey is in base64 format
    if (validatedData.fileKey.startsWith("base64:")) {
      // Parse base64 format: "base64:filename:base64data"
      const parts = validatedData.fileKey.split(":");
      if (parts.length !== 3) {
        throw new Error("Invalid base64 fileKey format. Expected format: base64:filename:base64data");
      }
      
      const [prefix, filename, base64Data] = parts;
      if (!filename || !base64Data) {
        throw new Error("Base64 fileKey must include both filename and base64 data");
      }

      // Store the base64 data in the database
      videoFileData = base64Data;
      filmUrl = null;
      
      console.log(`Processing base64 upload for filename: ${filename}`);
    } else {
      // Generate the public URL for the GCS object
      filmUrl = getPublicUrl(validatedData.fileKey);
      videoFileData = null;
      
      console.log(`Processing GCS upload for fileKey: ${validatedData.fileKey}`);
    }

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
        videoFileSize: validatedData.videoFileSize,
        videoMimeType: validatedData.videoMimeType,
        filmUrl: filmUrl,
        videoFileData: videoFileData,
        uploadDate: new Date(),
        processingStatus: 'uploaded',
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(newFilm satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
      status: 201,
    });

  } catch (error) {
    console.error("Error creating game film record:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to create film record: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}