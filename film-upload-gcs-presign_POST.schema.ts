import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  fileName: z.string().min(1, "File name cannot be empty."),
  contentType: z.string().min(1, "Content type cannot be empty."),
  fileSize: z.number().positive("File size must be a positive number."),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  uploadUrl: string;
  gcsObjectName: string;
};

export const postFilmUploadGcsPresign = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/film-upload-gcs-presign`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    try {
      const errorObject = superjson.parse(await result.text());
            const errorMessage = (errorObject as any)?.error || (errorObject as any)?.message || `Request failed with status ${result.status}`;
      throw new Error(errorMessage);
    } catch (e) {
      throw new Error(`Request failed with status ${result.status}`);
    }
  }
  
  return superjson.parse<OutputType>(await result.text());
};