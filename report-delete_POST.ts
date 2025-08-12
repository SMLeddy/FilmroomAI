import { db } from "../helpers/db";
import { schema, OutputType } from "./report-delete_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const { id } = schema.parse(json);

    const result = await db.transaction().execute(async (trx) => {
      // Delete associated report sections first
      await trx.deleteFrom('reportSections').where('reportId', '=', id).execute();
      
      // Then delete the report itself
      const deleteResult = await trx.deleteFrom('reports').where('id', '=', id).executeTakeFirst();
      
      return deleteResult;
    });

    if (result.numDeletedRows === 0n) {
        return new Response(superjson.stringify({ error: `Report with ID ${id} not found.` }), { status: 404 });
    }

    return new Response(superjson.stringify({ success: true } satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error deleting report:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}