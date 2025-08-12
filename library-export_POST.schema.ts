import { z } from "zod";
import superjson from 'superjson';

export const ExportFormatArray = ["csv", "json", "pdf"] as const;

export const schema = z.object({
  libraryId: z.number().int(),
  format: z.enum(ExportFormatArray),
  includeNotes: z.boolean().optional().default(true),
  includeMetadata: z.boolean().optional().default(true),
});

export type InputType = z.infer<typeof schema>;

// The output is a file blob, not JSON, so we define it as Blob.
export type OutputType = Blob;

export const postLibraryExport = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/library-export`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    // The error response is JSON, so we parse it to get the message.
    const errorObject = superjson.parse(await result.text()) as any;
    throw new Error(errorObject.error || "An unknown error occurred during export.");
  }

  // For file downloads, we need the filename from the Content-Disposition header.
  const disposition = result.headers.get('Content-Disposition');
  const filenameMatch = disposition && /filename="([^"]+)"/.exec(disposition);
  const filename = filenameMatch ? filenameMatch[1] : 'export.dat';

  const blob = await result.blob();
  
  // Attach filename to the blob for easier handling in the hook
  return new Blob([blob], { type: blob.type });
};