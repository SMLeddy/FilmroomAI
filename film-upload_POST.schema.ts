import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { GameFilms } from '../helpers/schema';

export const schema = z.object({
  title: z.string().min(1, "Title is required"),
  opponent: z.string().min(1, "Opponent is required"),
  gameDate: z.date({ required_error: "Game date is required" }),
  homeTeam: z.string().min(1, "Home team is required"),
  awayTeam: z.string().min(1, "Away team is required"),
  analyzingTeam: z.string().min(1, "Team being analyzed is required"),
  videoFile: z.instanceof(File, { message: "A video file is required" })
    .refine(file => file.size > 0, "File cannot be empty"),
  videoDurationSeconds: z.number().positive("Video duration must be positive"),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<GameFilms>;

export const postFilmUpload = async (data: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(data);

  const formData = new FormData();
  formData.append("title", validatedInput.title);
  formData.append("opponent", validatedInput.opponent);
  formData.append("gameDate", validatedInput.gameDate.toISOString());
  formData.append("homeTeam", validatedInput.homeTeam);
  formData.append("awayTeam", validatedInput.awayTeam);
  formData.append("analyzingTeam", validatedInput.analyzingTeam);
  formData.append("videoFile", validatedInput.videoFile);
  formData.append("videoDurationSeconds", validatedInput.videoDurationSeconds.toString());

  const result = await fetch(`/_api/film-upload`, {
    method: "POST",
    body: formData,
    ...init,
    // Do NOT set Content-Type, the browser will set it with the correct boundary
  });

  if (!result.ok) {
    let errorMessage = "Unknown error during file upload.";
    
    try {
      const responseText = await result.text();
      const errorObject = superjson.parse(responseText) as { 
        error?: string; 
        message?: string; 
        Message?: string; 
      };
      
      // Check for various error property names
      errorMessage = errorObject.error || errorObject.message || errorObject.Message || errorMessage;
    } catch (parseError) {
      // If JSON parsing fails, try to use the raw response text
      try {
        const rawText = await result.text();
        if (rawText) {
          errorMessage = rawText;
        }
      } catch {
        // Fall back to status-based error messages
        if (result.status === 413) {
          errorMessage = "File too large. Video files must be smaller than 6MB due to upload limits. Please compress your video or use a smaller file.";
        } else {
          errorMessage = `Upload failed with status ${result.status}`;
        }
      }
    }
    
    // Provide user-friendly error message for file size limits
    if (result.status === 413 || errorMessage.includes("6291456 bytes") || errorMessage.includes("Request must be smaller")) {
      errorMessage = "File too large. Video files must be smaller than 6MB due to upload limits. Please compress your video or use a smaller file.";
    }
    
    throw new Error(errorMessage);
  }
  return superjson.parse<OutputType>(await result.text());
};