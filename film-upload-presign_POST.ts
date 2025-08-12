import { schema, OutputType } from "./film-upload-presign_POST.schema";
import { getPresignedUploadUrl } from "../helpers/s3Utils";
import superjson from 'superjson';
import { z } from 'zod';

// 10 GB limit
const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; 

const serverSchema = schema.extend({
  fileSize: z.number().max(MAX_FILE_SIZE, `File size cannot exceed 10GB.`),
  fileType: z.string().startsWith('video/', 'File must be a video type.'),
});

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const validatedInput = serverSchema.parse(json);

    const { presignedUrl, fileKey } = await getPresignedUploadUrl({
      fileName: validatedInput.fileName,
      fileType: validatedInput.fileType,
      fileSize: validatedInput.fileSize,
    });

    const output: OutputType = { presignedUrl, fileKey };

    return new Response(superjson.stringify(output), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error generating presigned URL:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to get upload URL: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}