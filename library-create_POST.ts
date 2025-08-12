import { db } from "../helpers/db";
import { schema, InputType, OutputType } from "./library-create_POST.schema";
import superjson from 'superjson';
import { Transaction } from 'kysely';
import { DB } from '../helpers/schema';

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // In a real app, get user from session.
    const userEmail = 'coach.a@example.com';

    const newLibrary = await db.transaction().execute(async (trx) => {
      const createdLibrary = await trx
        .insertInto('libraries')
        .values({
          title: input.title,
          description: input.description,
          libraryType: input.libraryType,
          createdBy: userEmail,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      await trx
        .insertInto('libraryCollaborators')
        .values({
          libraryId: createdLibrary.id,
          collaboratorEmail: userEmail,
          invitedBy: userEmail,
          role: 'owner',
          permissionLevel: 'admin',
          acceptedAt: new Date(),
        })
        .execute();

      return createdLibrary;
    });

    return new Response(superjson.stringify(newLibrary satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error creating library:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to create library: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}