import superjson from 'superjson';
import { db } from '../helpers/db';
import { schema, OutputType } from './report-section-create_POST.schema';

export async function handle(request: Request): Promise<Response> {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const newSection = await db.transaction().execute(async (trx) => {
      const maxOrderIndexResult = await trx
        .selectFrom('reportSections')
        .select(db.fn.max('orderIndex').as('maxOrder'))
        .where('reportId', '=', input.reportId)
        .executeTakeFirst();

      const nextOrderIndex = (maxOrderIndexResult?.maxOrder ?? -1) + 1;

      const [createdSection] = await trx
        .insertInto('reportSections')
        .values({
          reportId: input.reportId,
          title: input.title,
          sectionType: input.sectionType,
          content: input.content ? JSON.stringify(input.content) : null,
          orderIndex: nextOrderIndex,
        })
        .returningAll()
        .execute();
      
      if (!createdSection) {
        throw new Error("Failed to create report section.");
      }

      return createdSection;
    });

    return new Response(superjson.stringify(newSection satisfies OutputType), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating report section:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}