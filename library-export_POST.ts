import { db } from "../helpers/db";
import { schema, OutputType, InputType } from "./library-export_POST.schema";
import superjson from 'superjson';

async function getLibraryData(libraryId: number) {
  // A user should only be able to export a library they have access to.
  // TODO: Add a proper permission check here based on the current user's session.
  // For now, we assume the user has access.

  const library = await db
    .selectFrom('libraries')
    .where('id', '=', libraryId)
    .select(['id', 'title', 'description', 'libraryType'])
    .executeTakeFirst();

  if (!library) {
    throw new Error("Library not found.");
  }

  const items = await db
    .selectFrom('libraryItems')
    .where('libraryId', '=', libraryId)
    .leftJoin('clips', 'libraryItems.clipId', 'clips.id')
    .leftJoin('plays', 'libraryItems.playId', 'plays.id')
    .select([
      'libraryItems.id', 'libraryItems.notes',
      'clips.id as clipId', 'clips.title as clipTitle', 'clips.playCall as clipPlayCall', 'clips.formation as clipFormation', 'clips.down as clipDown', 'clips.distance as clipDistance', 'clips.yardsGained as clipYardsGained', 'clips.playResult as clipPlayResult',
      'plays.id as playId', 'plays.playCall as playPlayCall', 'plays.formation as playFormation', 'plays.down as playDown', 'plays.distance as playDistance', 'plays.yardsGained as playYardsGained', 'plays.playResult as playPlayResult', 'plays.defensiveFront', 'plays.coverageScheme', 'plays.blitzType'
    ])
    .orderBy('libraryItems.sortOrder', 'asc')
    .orderBy('libraryItems.addedAt', 'asc')
    .execute();

  return { library, items };
}

function generateJson(data: Awaited<ReturnType<typeof getLibraryData>>): string {
  return superjson.stringify(data);
}

function generateCsv(data: Awaited<ReturnType<typeof getLibraryData>>, options: InputType): string {
  const { items } = data;
  const { includeNotes, includeMetadata } = options;

  const headers = [
    'Type', 'Title/Play Call', 'Formation', 'Down', 'Distance', 'Yards Gained', 'Play Result',
  ];
  if (includeMetadata) {
    headers.push('Defensive Front', 'Coverage Scheme', 'Blitz Type');
  }
  if (includeNotes) {
    headers.push('Notes');
  }

  const escapeCsvCell = (cell: any): string => {
    if (cell === null || cell === undefined) return '';
    const str = String(cell);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = items.map(item => {
    const isPlay = !!item.playId;
    const rowData = [
      isPlay ? 'Play' : 'Clip',
      isPlay ? item.playPlayCall : item.clipTitle,
      isPlay ? item.playFormation : item.clipFormation,
      isPlay ? item.playDown : item.clipDown,
      isPlay ? item.playDistance : item.clipDistance,
      isPlay ? item.playYardsGained : item.clipYardsGained,
      isPlay ? item.playPlayResult : item.clipPlayResult,
    ];

    if (includeMetadata) {
      rowData.push(
        isPlay ? item.defensiveFront : 'N/A',
        isPlay ? item.coverageScheme : 'N/A',
        isPlay ? item.blitzType : 'N/A'
      );
    }
    if (includeNotes) {
      rowData.push(item.notes);
    }
    return rowData.map(escapeCsvCell).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

function generatePdfSummary(data: Awaited<ReturnType<typeof getLibraryData>>): string {
  // NOTE: Actual PDF generation requires a library like 'pdf-lib' or 'jspdf' on the server,
  // which is not available in the current dependencies.
  // This is a placeholder implementation that returns a plain text summary.
  const { library, items } = data;
  let summary = `Library Export Summary: ${library.title}\n`;
  summary += `Description: ${library.description || 'N/A'}\n`;
  summary += `Total Items: ${items.length}\n\n`;
  summary += `----------------------------------------\n\n`;

  items.forEach((item, index) => {
    const isPlay = !!item.playId;
    summary += `Item ${index + 1}: [${isPlay ? 'Play' : 'Clip'}]\n`;
    summary += `  Title/Play Call: ${isPlay ? item.playPlayCall : item.clipTitle}\n`;
    summary += `  Formation: ${isPlay ? item.playFormation : item.clipFormation}\n`;
    summary += `  Situation: ${isPlay ? item.playDown : item.clipDown} & ${isPlay ? item.playDistance : item.clipDistance}\n`;
    summary += `  Result: ${isPlay ? item.playPlayResult : item.clipPlayResult} (${isPlay ? item.playYardsGained : item.clipYardsGained} yards)\n\n`;
  });

  return summary;
}

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const data = await getLibraryData(input.libraryId);
    const safeTitle = data.library.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    let fileContent: string;
    let contentType: string;
    let fileExtension: string;

    switch (input.format) {
      case 'json':
        fileContent = generateJson(data);
        contentType = 'application/json';
        fileExtension = 'json';
        break;
      case 'csv':
        fileContent = generateCsv(data, input);
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;
      case 'pdf':
        // Using placeholder text generation
        fileContent = generatePdfSummary(data);
        // Returning as text/plain since we can't generate a real PDF
        contentType = 'text/plain';
        fileExtension = 'txt'; // Should be 'pdf' with a real implementation
        break;
      default:
        throw new Error('Unsupported export format');
    }

    const filename = `${safeTitle}_export_${new Date().toISOString().split('T')[0]}.${fileExtension}`;

    return new Response(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Error exporting library:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to export library: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}