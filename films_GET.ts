import { db } from "../helpers/db";
import { schema, OutputType } from "./films_GET.schema";
import { getVideoStreamUrl } from "../helpers/videoStreamingUrls";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    // Parse optional query parameters
    // Convert filmId to number if provided
    const processedParams = {
      ...queryParams,
      ...(queryParams.filmId && { filmId: parseInt(queryParams.filmId, 10) })
    };
    const input = schema.parse(processedParams);

    let query = db
      .selectFrom('gameFilms')
      .selectAll()
      .orderBy('gameDate', 'desc');

    // Filter by opponent if provided
    if (input.opponent) {
      query = query.where('opponent', '=', input.opponent);
    }

    // Filter by team analyzed if provided
    if (input.teamAnalyzed) {
      query = query.where('teamAnalyzed', '=', input.teamAnalyzed);
    }

    // Filter by film ID if provided
    if (input.filmId) {
      query = query.where('id', '=', input.filmId);
    }

    const films = await query.execute();

    // Process films to add streaming URLs and optimize payload
    const processedFilms = await Promise.all(
      films.map(async (film) => {
        try {
          // Generate streaming URL for all films
          const streamingUrl = await getVideoStreamUrl(film, 'view');
          
          // For S3-stored films, exclude the base64 data from response to optimize payload
          if (film.storageType === 's3' && film.s3ObjectKey) {
            const { videoFileData, ...filmWithoutData } = film;
            return {
              ...filmWithoutData,
              streamingUrl,
              hasStreamingUrl: true,
            };
          }
          
          // For legacy films, include the streaming URL (which will be a data URL)
          return {
            ...film,
            streamingUrl,
            hasStreamingUrl: true,
          };
        } catch (error) {
          console.error(`Failed to generate streaming URL for film ID ${film.id}:`, error);
          
          // For films where URL generation fails, still return the film but mark as unavailable
          if (film.storageType === 's3') {
            const { videoFileData, ...filmWithoutData } = film;
            return {
              ...filmWithoutData,
              streamingUrl: null,
              hasStreamingUrl: false,
              streamingError: 'Video temporarily unavailable',
            };
          }
          
          return {
            ...film,
            streamingUrl: null,
            hasStreamingUrl: false,
            streamingError: 'Video temporarily unavailable',
          };
        }
      })
    );

    return new Response(superjson.stringify(processedFilms satisfies OutputType), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Error fetching game films:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to fetch game films: ${errorMessage}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}