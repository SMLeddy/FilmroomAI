import superjson from 'superjson';
import { db } from '../helpers/db';
import { schema, OutputType } from './report-generate-analysis_POST.schema';
import { ReportStatus } from '../helpers/reportSchema';

export async function handle(request: Request): Promise<Response> {
  try {
    const json = superjson.parse(await request.text());
    const { reportId } = schema.parse(json);

    // In a real application, this would trigger a long-running background job.
    // For now, we'll just update the report status to 'analyzing'.
    // The actual analysis content would be populated by the background job.

    const [updatedReport] = await db
      .updateTable('reports')
      .set({ 
        status: ReportStatus.Analyzing,
        updatedAt: new Date(),
      })
      .where('id', '=', reportId)
      .returningAll()
      .execute();

    if (!updatedReport) {
      return new Response(superjson.stringify({ error: `Report with ID ${reportId} not found.` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`AI analysis generation triggered for report ID: ${reportId}`);

    return new Response(superjson.stringify(updatedReport satisfies OutputType), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating report analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}