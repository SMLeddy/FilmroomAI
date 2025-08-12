import { URL } from 'url';
import superjson from 'superjson';
import { db } from '../helpers/db';
import { schema, OutputType } from './report-sections_GET.schema';

export async function handle(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const queryParams = {
      reportId: url.searchParams.get('reportId'),
    };

    const validatedInput = schema.parse({
      reportId: queryParams.reportId ? parseInt(queryParams.reportId, 10) : undefined,
    });

    const sections = await db
      .selectFrom('reportSections')
      .selectAll()
      .where('reportId', '=', validatedInput.reportId)
      .orderBy('orderIndex', 'asc')
      .execute();

    return new Response(superjson.stringify(sections satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching report sections:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}