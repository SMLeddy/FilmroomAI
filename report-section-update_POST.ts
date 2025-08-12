import superjson from 'superjson';
import { db } from '../helpers/db';
import { schema, OutputType } from './report-section-update_POST.schema';

export async function handle(request: Request): Promise<Response> {
  try {
    const json = superjson.parse(await request.text());
    const { id, ...updateData } = schema.parse(json);

    if (Object.keys(updateData).length === 0) {
      return new Response(superjson.stringify({ error: 'No update data provided.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const updatePayload: { title?: string; sectionType?: string; content?: string } = {};
    if (updateData.title) updatePayload.title = updateData.title;
    if (updateData.sectionType) updatePayload.sectionType = updateData.sectionType;
    if (updateData.content) updatePayload.content = JSON.stringify(updateData.content);


    const [updatedSection] = await db
      .updateTable('reportSections')
      .set(updatePayload)
      .where('id', '=', id)
      .returningAll()
      .execute();

    if (!updatedSection) {
      return new Response(superjson.stringify({ error: `Report section with ID ${id} not found.` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(superjson.stringify(updatedSection satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating report section:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}