import {
  createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState,
  type ReactNode,
} from "react";
import { buildRounds } from "../domain/fixture";
import { computeStandings, computeStats, type LeagueStats } from "../domain/standings";
import type { League, Player, PlayerId, Round, StandingRow } from "../domain/types";
import { leagueReducer, type LeagueAction } from "./leagueReducer";
import { fetchLeague, pushLeague, savedPassword, verifyPassword } from "./remote";
import { emptyLeague } from "./storage";

export type LoadStatus = "loading" | "ready" | "error";
export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface LeagueContextValue {
  league: League;
  /** Aplica un cambio y lo guarda en el servidor. Solo funciona en modo admin. */
  dispatch: (action: LeagueAction) => void;
  rounds: Round[];
  standings: StandingRow[];
  stats: LeagueStats;
  playerById: (id: PlayerId) => Player | undefined;

  loadStatus: LoadStatus;
  loadError: string | null;
  reload: () => void;

  isAdmin: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
  saveStatus: SaveStatus;
  saveError: string | null;
}

const LeagueContext = createContext<LeagueContextValue | null>(null);

const SAVE_DELAY_MS = 500;

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [league, rawDispatch] = useReducer(leagueReducer, undefined, emptyLeague);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(savedPassword.get);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  /** Hay cambios locales que todavía no se mandaron al servidor. */
  const dirty = useRef(false);

  const logout = useCallback(() => {
    savedPassword.set(null);
    setPassword(null);
  }, []);

  const reload = useCallback(async () => {
    if (dirty.current) return;
    try {
      const remote = await fetchLeague();
      if (!dirty.current) rawDispatch({ type: "replace", league: remote });
      setLoadStatus("ready");
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "No se pudo cargar la liga");
      setLoadStatus((s) => (s === "ready" ? s : "error"));
    }
  }, []);

  // Carga inicial y refresco al volver a la pestaña.
  useEffect(() => {
    reload();
    const onFocus = () => document.visibilityState === "visible" && reload();
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, [reload]);

  // Si había una contraseña recordada, confirmo que siga siendo válida.
  useEffect(() => {
    const pw = savedPassword.get();
    if (pw) verifyPassword(pw).catch(logout);
  }, [logout]);

  // Autoguardado de los cambios del admin.
  useEffect(() => {
    if (!dirty.current || !password) return;
    setSaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        await pushLeague(league, password);
        dirty.current = false;
        setSaveStatus("saved");
        setSaveError(null);
      } catch (e) {
        setSaveStatus("error");
        setSaveError(e instanceof Error ? e.message : "No se pudo guardar");
      }
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [league, password]);

  const dispatch = useCallback(
    (action: LeagueAction) => {
      if (!password) return;
      dirty.current = true;
      rawDispatch(action);
    },
    [password],
  );

  const login = useCallback(async (pw: string) => {
    await verifyPassword(pw);
    savedPassword.set(pw);
    setPassword(pw);
  }, []);

  const value = useMemo<LeagueContextValue>(() => {
    const byId = new Map(league.players.map((p) => [p.id, p]));
    return {
      league,
      dispatch,
      rounds: buildRounds(league),
      standings: computeStandings(league),
      stats: computeStats(league),
      playerById: (id) => byId.get(id),
      loadStatus,
      loadError,
      reload,
      isAdmin: !!password,
      login,
      logout,
      saveStatus,
      saveError,
    };
  }, [league, dispatch, loadStatus, loadError, reload, password, login, logout, saveStatus, saveError]);

  return <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>;
}

export function useLeague(): LeagueContextValue {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error("useLeague debe usarse dentro de <LeagueProvider>");
  return ctx;
}
