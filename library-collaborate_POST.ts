import { db } from "../helpers/db";
import { schema, OutputType } from "./library-collaborate_POST.schema";
import superjson from 'superjson';
import { PermissionLevelArrayValues, PermissionLevel } from '../helpers/schema';

const roleToPermissionMap: Record<string, PermissionLevel> = {
  owner: 'admin',
  editor: 'edit',
  commenter: 'comment',
  viewer: 'view',
};

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // TODO: Add permission check (owner to invite/change roles).
    const userEmail = 'coach.a@example.com';

    const newCollaborator = await db
      .insertInto('libraryCollaborators')
      .values({
        libraryId: input.libraryId,
        collaboratorEmail: input.collaboratorEmail,
        role: input.role,
        permissionLevel: roleToPermissionMap[input.role],
        invitedBy: userEmail,
        invitedAt: new Date(),
      })
      .onConflict((oc) => oc
        .columns(['libraryId', 'collaboratorEmail'])
        .doUpdateSet({ 
          role: input.role,
          permissionLevel: roleToPermissionMap[input.role],
        })
      )
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(newCollaborator satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in collaboration endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to update collaborator: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}