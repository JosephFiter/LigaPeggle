import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from "react";
import { buildRounds } from "../domain/fixture";
import { computeStandings, computeStats, type LeagueStats } from "../domain/standings";
import type { League, Player, PlayerId, Round, StandingRow } from "../domain/types";
import { leagueReducer, type LeagueAction } from "./leagueReducer";
import { loadLeague, saveLeague } from "./storage";

interface LeagueContextValue {
  league: League;
  dispatch: Dispatch<LeagueAction>;
  rounds: Round[];
  standings: StandingRow[];
  stats: LeagueStats;
  playerById: (id: PlayerId) => Player | undefined;
}

const LeagueContext = createContext<LeagueContextValue | null>(null);

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [league, dispatch] = useReducer(leagueReducer, undefined, loadLeague);

  useEffect(() => saveLeague(league), [league]);

  const value = useMemo<LeagueContextValue>(() => {
    const byId = new Map(league.players.map((p) => [p.id, p]));
    return {
      league,
      dispatch,
      rounds: buildRounds(league),
      standings: computeStandings(league),
      stats: computeStats(league),
      playerById: (id) => byId.get(id),
    };
  }, [league]);

  return <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>;
}

export function useLeague(): LeagueContextValue {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error("useLeague debe usarse dentro de <LeagueProvider>");
  return ctx;
}
