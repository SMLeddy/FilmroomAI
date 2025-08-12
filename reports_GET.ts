import { db } from "../helpers/db";
import { schema, OutputType } from "./reports_GET.schema";
import superjson from 'superjson';
import { URL } from 'url';

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = {
      id: url.searchParams.get('id') ? parseInt(url.searchParams.get('id')!, 10) : undefined,
      status: url.searchParams.get('status') || undefined,
      focusArea: url.searchParams.get('focusArea') || undefined,
      opponentName: url.searchParams.get('opponentName') || undefined,
    };

    const { id, status, focusArea, opponentName } = schema.parse(queryParams);

    let query = db.selectFrom('reports').selectAll();

    if (id) {
      query = query.where('id', '=', id);
    } else {
      if (status) {
        query = query.where('status', '=', status);
      }
      if (focusArea) {
        query = query.where('focusArea', '=', focusArea);
      }
      if (opponentName) {
        query = query.where('opponentName', 'ilike', `%${opponentName}%`);
      }
    }

    const reports = await query.orderBy('createdAt', 'desc').execute();

    return new Response(superjson.stringify(reports satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), { status: 400 });
  }
}