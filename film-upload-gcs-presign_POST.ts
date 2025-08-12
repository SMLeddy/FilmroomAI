import { schema, OutputType } from "./film-upload-gcs-presign_POST.schema";
import superjson from 'superjson';
import { Storage } from '@google-cloud/storage';
import { nanoid } from 'nanoid';
import { GCS_BUCKET_NAME } from "../helpers/_publicConfigs";

// This function initializes the GCS client.
// It's defined outside the handler to be potentially reused and to keep the handler clean.
function getGcsStorageClient() {
  const gcsServiceAccountKey = process.env.GCS_SERVICE_ACCOUNT_KEY;

  if (!gcsServiceAccountKey) {
    console.error("GCS_SERVICE_ACCOUNT_KEY environment variable is not set.");
    throw new Error("Server configuration error: GCS credentials not found.");
  }

  try {
    const credentials = JSON.parse(gcsServiceAccountKey);
    return new Storage({ credentials });
  } catch (error) {
    console.error("Failed to parse GCS_SERVICE_ACCOUNT_KEY JSON:", error);
    throw new Error("Server configuration error: Invalid GCS credentials format.");
  }
}

export async function handle(request: Request) {
  if (request.method !== 'POST') {
    return new Response(superjson.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const json = superjson.parse(await request.text());
    const { fileName, contentType, fileSize } = schema.parse(json);

    // Basic security check for file size
    const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB
    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return new Response(superjson.stringify({ error: `File size exceeds the limit of 5 GB.` }), { status: 400 });
    }

    const storage = getGcsStorageClient();
    const bucket = storage.bucket(GCS_BUCKET_NAME);

    // Sanitize filename to prevent path traversal and other attacks
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueId = nanoid(16);
    const gcsObjectName = `uploads/${uniqueId}-${sanitizedFileName}`;

    const options = {
      version: 'v4' as const,
      action: 'write' as const,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: contentType,
    };

    const [uploadUrl] = await bucket.file(gcsObjectName).getSignedUrl(options);

    const response: OutputType = {
      uploadUrl,
      gcsObjectName,
    };

    return new Response(superjson.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error generating GCS presigned URL:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    // Use 500 for server-side errors (like config issues), 400 for client errors (like bad input)
    const statusCode = errorMessage.includes("Server configuration error") ? 500 : 400;
    return new Response(superjson.stringify({ error: errorMessage }), { status: statusCode });
  }
}