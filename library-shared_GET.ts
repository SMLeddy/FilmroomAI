import { z } from 'zod';
import superjson from 'superjson';
import { db } from '../helpers/db';
import { schema, type InputType, type OutputType } from './library-shared_GET.schema';
import { verifyPassword } from '../helpers/cryptoUtils';

export const handle = async (request: Request): Promise<Response> => {
  try {
    if (request.method !== 'GET') {
      return new Response(superjson.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const shareId = url.searchParams.get('shareId');
    const passwordParam = url.searchParams.get('password');
    // Convert null to undefined for Zod validation
    const password = passwordParam === null ? undefined : passwordParam;

    if (!shareId) {
      return new Response(superjson.stringify({ error: 'Share ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build params object, only including password if it's defined
    const params: { shareId: string; password?: string } = { shareId: shareId! };
    if (password !== undefined) {
      params.password = password;
    }
    
    const validatedParams = schema.parse(params);

    // Find the share link
    const shareLink = await db
      .selectFrom('libraryShareLinks')
      .selectAll()
      .where('shareId', '=', validatedParams.shareId)
      .executeTakeFirst();

    if (!shareLink) {
      return new Response(superjson.stringify({ error: 'Share link not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if link has expired
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      return new Response(superjson.stringify({ error: 'Share link has expired' }), {
        status: 410,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check password if required
    if (shareLink.passwordHash) {
      if (!validatedParams.password) {
        return new Response(superjson.stringify({ error: 'Password required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const passwordValid = verifyPassword(validatedParams.password, shareLink.passwordHash);
      if (!passwordValid) {
        return new Response(superjson.stringify({ error: 'Invalid password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Increment access count
    await db
      .updateTable('libraryShareLinks')
      .set({ accessCount: (shareLink.accessCount || 0) + 1 })
      .where('id', '=', shareLink.id)
      .execute();

    // Get library details
    const library = await db
      .selectFrom('libraries')
      .selectAll()
      .where('id', '=', shareLink.libraryId)
      .executeTakeFirst();

    if (!library) {
      return new Response(superjson.stringify({ error: 'Library not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get library items with clip and play details
    const items = await db
      .selectFrom('libraryItems')
      .leftJoin('clips', 'libraryItems.clipId', 'clips.id')
      .leftJoin('plays', 'libraryItems.playId', 'plays.id')
      .select([
        'libraryItems.id',
        'libraryItems.clipId',
        'libraryItems.playId',
        'libraryItems.notes',
        'libraryItems.sortOrder',
        'clips.title as clipTitle',
        'clips.playCall as clipPlayCall',
        'plays.playCall as playPlayCall',
        'plays.formation as playFormation',
      ])
      .where('libraryItems.libraryId', '=', shareLink.libraryId)
      .orderBy('libraryItems.sortOrder', 'asc')
      .execute();

    const result: OutputType = {
      library,
      items,
    };

    return new Response(superjson.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching shared library:', error);
    
    // Provide more detailed error information for debugging
    let errorMessage = 'Failed to fetch shared library';
    let statusCode = 500;
    
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors);
      errorMessage = 'Invalid request parameters: ' + error.errors.map(e => e.message).join(', ');
      statusCode = 400;
    } else if (error instanceof Error) {
      console.error('Error message:', error.message);
      // Don't expose internal error messages to client in production
      errorMessage = 'Failed to fetch shared library';
    }
    
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};