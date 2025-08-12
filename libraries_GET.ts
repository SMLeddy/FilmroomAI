import { db } from "../helpers/db";
import { OutputType } from "./libraries_GET.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    // In a real app, you'd get the user's email/ID from their session/token.
    // For this example, we'll use a hardcoded email.
    const userEmail = 'coach.a@example.com';

    const libraries = await db
      .selectFrom('libraries')
      .leftJoin('libraryCollaborators', 'libraries.id', 'libraryCollaborators.libraryId')
      .selectAll('libraries')
      .where((eb) => eb.or([
        eb('libraries.createdBy', '=', userEmail),
        eb('libraryCollaborators.collaboratorEmail', '=', userEmail)
      ]))
      .distinct()
      .orderBy('libraries.updatedAt', 'desc')
      .execute();

    return new Response(superjson.stringify(libraries satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching libraries:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to fetch libraries: ${errorMessage}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}