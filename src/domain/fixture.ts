import type { League, Match, PlayerId, Round } from "./types";

/** Clave estable de un par de jugadores, independiente del orden. */
export function matchKey(x: PlayerId, y: PlayerId): string {
  return x < y ? `${x}|${y}` : `${y}|${x}`;
}

export function sortPair(x: PlayerId, y: PlayerId): [PlayerId, PlayerId] {
  return x < y ? [x, y] : [y, x];
}

/**
 * Genera el fixture de todos contra todos (una vuelta) con el método del círculo.
 * Con n jugadores hay n-1 fechas (n si es impar, con un jugador libre por fecha).
 */
export function buildRounds(league: League): Round[] {
  const ids: (PlayerId | null)[] = league.players.map((p) => p.id);
  if (ids.length < 2) return [];
  if (ids.length % 2 === 1) ids.push(null);

  const n = ids.length;
  const rounds: Round[] = [];
  let rotation = [...ids];

  for (let r = 0; r < n - 1; r++) {
    const round: Round = { number: r + 1, matches: [] };
    for (let i = 0; i < n / 2; i++) {
      const x = rotation[i];
      const y = rotation[n - 1 - i];
      if (x === null || y === null) {
        round.bye = (x ?? y) ?? undefined;
        continue;
      }
      const [a, b] = sortPair(x, y);
      const key = matchKey(a, b);
      round.matches.push({ key, a, b, round: r + 1, result: league.results[key] });
    }
    rounds.push(round);
    // Fijo el primero y roto el resto una posición.
    rotation = [rotation[0], rotation[n - 1], ...rotation.slice(1, n - 1)];
  }
  return rounds;
}

export function allMatches(league: League): Match[] {
  return buildRounds(league).flatMap((r) => r.matches);
}

export function pendingMatches(league: League): Match[] {
  return allMatches(league).filter((m) => !m.result);
}

export function involves(match: Match, id: PlayerId): boolean {
  return match.a === id || match.b === id;
}

export function opponentOf(match: Match, id: PlayerId): PlayerId {
  return match.a === id ? match.b : match.a;
}
