import { allMatches } from "./fixture";
import { RULES } from "./rules";
import type { League, MatchResult, PlayerId, StandingRow } from "./types";

type Outcome = "W" | "D" | "L";

export function outcomeFor(result: MatchResult, id: PlayerId): Outcome {
  const mine = result.a === id ? result.scoreA : result.scoreB;
  const theirs = result.a === id ? result.scoreB : result.scoreA;
  return mine > theirs ? "W" : mine < theirs ? "L" : "D";
}

export function winnerOf(result: MatchResult): PlayerId | null {
  if (result.scoreA === result.scoreB) return null;
  return result.scoreA > result.scoreB ? result.a : result.b;
}

/** Orden por fecha de juego; los resultados sin fecha van primero. */
const byDate = (x: MatchResult, y: MatchResult) =>
  (x.playedOn ?? "").localeCompare(y.playedOn ?? "");

/**
 * Tabla de posiciones. Criterios: puntos, diferencia de score,
 * score a favor, enfrentamiento directo y por último nombre.
 */
export function computeStandings(league: League): StandingRow[] {
  const matches = allMatches(league);
  const results = matches.flatMap((m) => (m.result ? [m.result] : [])).sort(byDate);

  const rows = new Map<PlayerId, StandingRow>(
    league.players.map((player) => [
      player.id,
      {
        player,
        played: 0, won: 0, drawn: 0, lost: 0, points: 0,
        scoreFor: 0, scoreAgainst: 0, scoreDiff: 0, bestScore: 0,
        pending: 0, form: [],
      },
    ]),
  );

  for (const m of matches) {
    if (m.result) continue;
    rows.get(m.a)!.pending++;
    rows.get(m.b)!.pending++;
  }

  for (const r of results) {
    for (const id of [r.a, r.b]) {
      const row = rows.get(id)!;
      const mine = r.a === id ? r.scoreA : r.scoreB;
      const theirs = r.a === id ? r.scoreB : r.scoreA;
      const outcome = outcomeFor(r, id);
      row.played++;
      row.scoreFor += mine;
      row.scoreAgainst += theirs;
      row.bestScore = Math.max(row.bestScore, mine);
      row.form.push(outcome);
      if (outcome === "W") { row.won++; row.points += RULES.pointsWin; }
      else if (outcome === "D") { row.drawn++; row.points += RULES.pointsDraw; }
      else { row.lost++; row.points += RULES.pointsLoss; }
    }
  }

  const list = [...rows.values()];
  for (const row of list) {
    row.scoreDiff = row.scoreFor - row.scoreAgainst;
    row.form = row.form.slice(-RULES.formLength);
  }

  return list.sort((x, y) => {
    if (y.points !== x.points) return y.points - x.points;
    if (y.scoreDiff !== x.scoreDiff) return y.scoreDiff - x.scoreDiff;
    if (y.scoreFor !== x.scoreFor) return y.scoreFor - x.scoreFor;
    const h2h = headToHead(league, x.player.id, y.player.id);
    if (h2h) return h2h === x.player.id ? -1 : 1;
    return x.player.name.localeCompare(y.player.name);
  });
}

function headToHead(league: League, x: PlayerId, y: PlayerId): PlayerId | null {
  const r = Object.values(league.results).find(
    (res) => (res.a === x && res.b === y) || (res.a === y && res.b === x),
  );
  return r ? winnerOf(r) : null;
}

export interface LeagueStats {
  total: number;
  played: number;
  highestScore?: { playerId: PlayerId; score: number; result: MatchResult };
  biggestWin?: { winnerId: PlayerId; margin: number; result: MatchResult };
  closestMatch?: { margin: number; result: MatchResult };
  averageScore: number;
}

export function computeStats(league: League): LeagueStats {
  const matches = allMatches(league);
  const results = matches.flatMap((m) => (m.result ? [m.result] : []));
  const stats: LeagueStats = { total: matches.length, played: results.length, averageScore: 0 };

  let sum = 0;
  for (const r of results) {
    sum += r.scoreA + r.scoreB;
    for (const [id, score] of [[r.a, r.scoreA], [r.b, r.scoreB]] as const) {
      if (!stats.highestScore || score > stats.highestScore.score) {
        stats.highestScore = { playerId: id, score, result: r };
      }
    }
    const margin = Math.abs(r.scoreA - r.scoreB);
    const winner = winnerOf(r);
    if (winner && (!stats.biggestWin || margin > stats.biggestWin.margin)) {
      stats.biggestWin = { winnerId: winner, margin, result: r };
    }
    if (!stats.closestMatch || margin < stats.closestMatch.margin) {
      stats.closestMatch = { margin, result: r };
    }
  }
  stats.averageScore = results.length ? Math.round(sum / (results.length * 2)) : 0;
  return stats;
}
