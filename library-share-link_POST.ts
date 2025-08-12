import { z } from 'zod';
import superjson from 'superjson';
import { db } from '../helpers/db';
import { schema, type InputType, type OutputType } from './library-share-link_POST.schema';
import { randomBytes } from 'crypto';
import { hashPassword } from '../helpers/cryptoUtils';

export const handle = async (request: Request): Promise<Response> => {
  try {
    if (request.method !== 'POST') {
      return new Response(superjson.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = superjson.parse(await request.text()) as InputType;
    const validatedInput = schema.parse(body);

    // Generate unique share ID
    const shareId = randomBytes(16).toString('hex');

    // Hash password if provided
    let passwordHash: string | null = null;
    if (validatedInput.password) {
      passwordHash = hashPassword(validatedInput.password);
    }

    // For now, we'll use a placeholder user ID since auth isn't implemented
    const createdBy = 'system';

    // Create the share link record
    const shareLink = await db
      .insertInto('libraryShareLinks')
      .values({
        libraryId: validatedInput.libraryId,
        shareId,
        expiresAt: validatedInput.expiresAt || null,
        passwordHash,
        createdBy,
        accessCount: 0,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    const result: OutputType = {
      id: shareLink.id,
      libraryId: shareLink.libraryId,
      shareId: shareLink.shareId,
      createdAt: shareLink.createdAt!,
      expiresAt: shareLink.expiresAt,
      accessCount: shareLink.accessCount!,
      passwordHash: shareLink.passwordHash,
      createdBy: shareLink.createdBy,
    };

    return new Response(superjson.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating share link:', error);
    return new Response(superjson.stringify({ error: 'Failed to create share link' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};