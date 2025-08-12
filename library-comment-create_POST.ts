import { db } from "../helpers/db";
import { schema, OutputType } from "./library-comment-create_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // TODO: Add permission check (commenter, editor, or owner).
    const userEmail = 'coach.a@example.com';

    const newComment = await db
      .insertInto('libraryComments')
      .values({
        libraryItemId: input.libraryItemId,
        content: input.content,
        authorEmail: userEmail,
        parentCommentId: input.parentCommentId,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return new Response(superjson.stringify(newComment satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to create comment: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}