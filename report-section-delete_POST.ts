import superjson from 'superjson';
import { db } from '../helpers/db';
import { schema, OutputType } from './report-section-delete_POST.schema';

export async function handle(request: Request): Promise<Response> {
  try {
    const json = superjson.parse(await request.text());
    const { id } = schema.parse(json);

    const result = await db
      .deleteFrom('reportSections')
      .where('id', '=', id)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      return new Response(superjson.stringify({ error: `Report section with ID ${id} not found.` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(superjson.stringify({ success: true } satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting report section:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}