import { db } from "../helpers/db";
import { schema, OutputType } from "./defensive-analytics_GET.schema";
import superjson from 'superjson';
import { sql, Expression, SqlBool } from 'kysely';
import { DB } from "../helpers/schema";

type CountResult = { name: string; count: number };
type SituationalCountResult = { name: string; down: string; count: number };

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const transformedParams: Record<string, any> = { ...queryParams };
    if (queryParams.filmId) {
      transformedParams.filmId = Number(queryParams.filmId);
    }
    if (queryParams['distance[gte]']) {
      transformedParams.distance = { ...transformedParams.distance, gte: Number(queryParams['distance[gte]']) };
    }
    if (queryParams['distance[lte]']) {
      transformedParams.distance = { ...transformedParams.distance, lte: Number(queryParams['distance[lte]']) };
    }

    const input = schema.parse(transformedParams);

    const baseQuery = db.selectFrom('plays').where((eb) => {
      const conditions: Expression<SqlBool>[] = [];

      if (input.filmId) {
        conditions.push(eb('plays.filmId', '=', input.filmId));
      }

      if (input.down) {
        conditions.push(eb('plays.down', '=', input.down));
      }
      if (input.formation) {
        conditions.push(eb('plays.formation', '=', input.formation));
      }
      if (input.distance?.gte) {
        conditions.push(eb('plays.distance', '>=', input.distance.gte));
      }
      if (input.distance?.lte) {
        conditions.push(eb('plays.distance', '<=', input.distance.lte));
      }
      if (input.fieldPosition) {
        if (input.fieldPosition === 'redZone') {
          conditions.push(eb('plays.yardLine', '<=', 20));
        } else if (input.fieldPosition === 'backedUp') {
          conditions.push(eb('plays.yardLine', '>=', 80));
        } else if (input.fieldPosition === 'midfield') {
          conditions.push(eb.and([
            eb('plays.yardLine', '>', 20),
            eb('plays.yardLine', '<', 80)
          ]));
        }
      }
      return eb.and(conditions);
    });

    let playsQuery = baseQuery;
    if (input.opponent) {
      playsQuery = playsQuery
        .innerJoin('gameFilms', 'plays.filmId', 'gameFilms.id')
        .where('gameFilms.opponent', '=', input.opponent);
    }

    const totalPlaysResult = await playsQuery
      .select(db.fn.count<number>('plays.id').as('count'))
      .executeTakeFirst();
    const totalPlays = totalPlaysResult?.count ?? 0;

    // Defensive Front Usage
    const defensiveFrontUsage: SituationalCountResult[] = totalPlays > 0 ? await playsQuery
      .select(['plays.defensiveFront as name', 'plays.down', sql<number>`count(*)::int`.as('count')])
      .where('plays.defensiveFront', 'is not', null)
      .where('plays.down', 'is not', null)
      .groupBy(['plays.defensiveFront', 'plays.down'])
      .orderBy('count', 'desc')
      .execute() as SituationalCountResult[] : [];

    // Personnel Packages
    const personnelPackages: SituationalCountResult[] = totalPlays > 0 ? await playsQuery
      .select(['plays.defensivePersonnel as name', 'plays.down', sql<number>`count(*)::int`.as('count')])
      .where('plays.defensivePersonnel', 'is not', null)
      .where('plays.down', 'is not', null)
      .groupBy(['plays.defensivePersonnel', 'plays.down'])
      .orderBy('count', 'desc')
      .execute() as SituationalCountResult[] : [];

    // Coverage Tendencies
    const coverageTendencies: CountResult[] = totalPlays > 0 ? await playsQuery
      .select(['plays.coverageScheme as name', sql<number>`count(*)::int`.as('count')])
      .where('plays.coverageScheme', 'is not', null)
      .groupBy('plays.coverageScheme')
      .orderBy('count', 'desc')
      .execute() as CountResult[] : [];

    // Blitz Analysis
    const blitzPlaysQuery = playsQuery.where('plays.blitzType', 'is not', null).where('plays.blitzType', '!=', 'no_blitz');
    const totalBlitzesResult = await blitzPlaysQuery
      .select(db.fn.count<number>('plays.id').as('count'))
      .executeTakeFirst();
    const totalBlitzes = totalBlitzesResult?.count ?? 0;

    const topBlitzTypes: CountResult[] = totalBlitzes > 0 ? await blitzPlaysQuery
      .select(['plays.blitzType as name', sql<number>`count(*)::int`.as('count')])
      .groupBy('plays.blitzType')
      .orderBy('count', 'desc')
      .limit(5)
      .execute() as CountResult[] : [];

    const blitzPatterns = {
      totalPlays,
      blitzRate: totalPlays > 0 ? totalBlitzes / totalPlays : 0,
      topBlitzTypes,
    };

    const output: OutputType = {
      defensiveFrontUsage,
      personnelPackages,
      coverageTendencies,
      blitzPatterns,
    };

    return new Response(superjson.stringify(output), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error fetching defensive analytics:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to fetch defensive analytics: ${errorMessage}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}