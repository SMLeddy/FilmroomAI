import { db } from "../helpers/db";
import { schema, OutputType } from "./opponent-analytics_GET.schema";
import superjson from 'superjson';
import { sql } from 'kysely';
import { Selectable } from "kysely";
import { Plays } from "../helpers/schema";

type Play = Selectable<Plays>;

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const input = schema.parse(queryParams);

    const filmIds = await db
      .selectFrom('gameFilms')
      .select('id')
      .where('opponent', '=', input.opponentName)
      .execute();

    if (filmIds.length === 0) {
      return new Response(superjson.stringify({ error: `Opponent not found: ${input.opponentName}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const filmIdList = filmIds.map(f => f.id);

    const plays = await db
      .selectFrom('plays')
      .selectAll()
      .where('filmId', 'in', filmIdList)
      .execute();

    const totalPlays = plays.length;

    // Formation Usage
    const formationUsage = plays.reduce((acc, play) => {
      if (play.formation && play.down) {
        const key = `${play.formation}-${play.down}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Play Call Tendencies
    const playCallTendencies = plays.reduce((acc, play) => {
      if (play.playCall) {
        acc[play.playCall] = (acc[play.playCall] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Red Zone Patterns
    const redZonePlays = plays.filter(p => p.yardLine !== null && p.yardLine <= 20);
    const redZoneTouchdowns = redZonePlays.filter(p => p.playResult === 'touchdown').length;
    const redZoneFieldGoals = redZonePlays.filter(p => p.playResult === 'field_goal').length;
    const redZoneTurnovers = redZonePlays.filter(p => p.playResult === 'fumble' || p.playResult === 'interception').length;
    const redZonePlayCalls = redZonePlays.reduce((acc, play) => {
        if (play.playCall) acc[play.playCall] = (acc[play.playCall] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Third Down Success
    const thirdDownPlays = plays.filter(p => p.down === '3rd');
    const thirdDownConversions = thirdDownPlays.filter(p => p.playResult === 'first_down' || p.playResult === 'touchdown').length;
    const thirdDownPlayCalls = thirdDownPlays.reduce((acc, play) => {
        if (play.playCall) acc[play.playCall] = (acc[play.playCall] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Personnel Packages
    const playIds = plays.map(p => p.id);
    const personnelTags = playIds.length > 0 ? await db.selectFrom('playTags')
        .select(['tagValue'])
        .where('playId', 'in', playIds)
        .where('tagName', '=', 'personnel')
        .where('tagValue', 'is not', null)
        .execute() : [];
    
    const personnelUsage = personnelTags.reduce((acc, tag) => {
        if(tag.tagValue) acc[tag.tagValue] = (acc[tag.tagValue] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const toSortedArray = (data: Record<string, number>) => Object.entries(data)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const output: OutputType = {
      overview: {
        opponentName: input.opponentName,
        totalGames: filmIdList.length,
        totalPlays,
      },
      formationUsage: Object.entries(formationUsage).map(([key, count]) => {
        const [formation, down] = key.split('-');
        return { formation, down, count };
      }).sort((a, b) => b.count - a.count),
      playCallTendencies: toSortedArray(playCallTendencies),
      redZonePatterns: {
        totalPlays: redZonePlays.length,
        touchdownRate: redZonePlays.length > 0 ? (redZoneTouchdowns / redZonePlays.length) : 0,
        fieldGoalRate: redZonePlays.length > 0 ? (redZoneFieldGoals / redZonePlays.length) : 0,
        turnoverRate: redZonePlays.length > 0 ? (redZoneTurnovers / redZonePlays.length) : 0,
        topPlayCalls: toSortedArray(redZonePlayCalls).slice(0, 5),
      },
      thirdDownSuccessRates: {
        totalAttempts: thirdDownPlays.length,
        conversions: thirdDownConversions,
        successRate: thirdDownPlays.length > 0 ? (thirdDownConversions / thirdDownPlays.length) : 0,
        topPlayCalls: toSortedArray(thirdDownPlayCalls).slice(0, 5),
      },
      personnelPackageUsage: toSortedArray(personnelUsage),
    };

    return new Response(superjson.stringify(output), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching opponent analytics:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: `Failed to fetch opponent analytics: ${errorMessage}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}