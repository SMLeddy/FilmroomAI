import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { Libraries } from '../helpers/schema';
import type { OutputType as LibraryItemsType } from './library-items_GET.schema';

export const schema = z.object({
  shareId: z.string(),
  password: z.string().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  library: Selectable<Libraries>;
  items: LibraryItemsType;
  requiresPassword?: boolean;
};

export const getLibraryShared = async (params: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedParams = schema.parse(params);
  const searchParams = new URLSearchParams();
  searchParams.set('shareId', validatedParams.shareId);
  if (validatedParams.password) {
    searchParams.set('password', validatedParams.password);
  }

  const result = await fetch(`/_api/library-shared?${searchParams.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as any;
    // Special handling for password requirement
    if (result.status === 401 && errorObject.error === 'Password required') {
        return { library: {} as any, items: [], requiresPassword: true };
    }
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};