import superjson from 'superjson';
import { db } from '../helpers/db';
import { schema, OutputType } from './report-sections-reorder_POST.schema';

export async function handle(request: Request): Promise<Response> {
  try {
    const json = superjson.parse(await request.text());
    const { reportId, sections } = schema.parse(json);

    await db.transaction().execute(async (trx) => {
      const updates = sections.map(section => 
        trx.updateTable('reportSections')
          .set({ orderIndex: section.orderIndex })
          .where('id', '=', section.id)
          .where('reportId', '=', reportId) // Ensure we only update sections within the correct report
          .execute()
      );
      await Promise.all(updates);
    });

    return new Response(superjson.stringify({ success: true } satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error reordering report sections:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}