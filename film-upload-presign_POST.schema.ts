import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().positive("File size must be a positive number"),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  presignedUrl: string;
  fileKey: string;
};

export const postFilmUploadPresign = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/film-upload-presign`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as any;
    const errorMessage = errorObject?.error || errorObject?.message || errorObject?.Message || 'Failed to get presigned URL';
    throw new Error(errorMessage);
  }

  return superjson.parse<OutputType>(await result.text());
};