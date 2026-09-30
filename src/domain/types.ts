export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  /** Id del Peggle Master elegido como avatar (ver masters.ts). */
  masterId: string;
}

/** Resultado de un enfrentamiento. `a`/`b` son los ids ordenados del par. */
export interface MatchResult {
  a: PlayerId;
  b: PlayerId;
  scoreA: number;
  scoreB: number;
  /** Fecha ISO (yyyy-mm-dd) en que se jugó. */
  playedOn?: string;
}

export interface League {
  name: string;
  players: Player[];
  /** Resultados indexados por clave de par (ver matchKey). */
  results: Record<string, MatchResult>;
}

/** Un cruce de la liga, jugado o no. */
export interface Match {
  key: string;
  a: PlayerId;
  b: PlayerId;
  round: number;
  result?: MatchResult;
}

export interface Round {
  number: number;
  matches: Match[];
  /** Jugador que queda libre esta fecha (cantidad impar de jugadores). */
  bye?: PlayerId;
}

export interface StandingRow {
  player: Player;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  scoreFor: number;
  scoreAgainst: number;
  scoreDiff: number;
  bestScore: number;
  pending: number;
  /** Últimos resultados, del más viejo al más nuevo. */
  form: ("W" | "D" | "L")[];
}
