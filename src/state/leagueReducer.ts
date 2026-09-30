import { matchKey, sortPair } from "../domain/fixture";
import type { League, PlayerId } from "../domain/types";
import { emptyLeague } from "./storage";

export type LeagueAction =
  | { type: "renameLeague"; name: string }
  | { type: "addPlayer"; name: string; masterId: string }
  | { type: "updatePlayer"; id: PlayerId; name: string; masterId: string }
  | { type: "removePlayer"; id: PlayerId }
  | { type: "setResult"; x: PlayerId; y: PlayerId; scoreX: number; scoreY: number; playedOn?: string }
  | { type: "clearResult"; x: PlayerId; y: PlayerId }
  | { type: "replace"; league: League }
  | { type: "reset" };

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function leagueReducer(state: League, action: LeagueAction): League {
  switch (action.type) {
    case "renameLeague":
      return { ...state, name: action.name };

    case "addPlayer":
      return {
        ...state,
        players: [...state.players, { id: newId(), name: action.name.trim(), masterId: action.masterId }],
      };

    case "updatePlayer":
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.id ? { ...p, name: action.name.trim(), masterId: action.masterId } : p,
        ),
      };

    case "removePlayer": {
      const results = Object.fromEntries(
        Object.entries(state.results).filter(([, r]) => r.a !== action.id && r.b !== action.id),
      );
      return { ...state, players: state.players.filter((p) => p.id !== action.id), results };
    }

    case "setResult": {
      const [a, b] = sortPair(action.x, action.y);
      const flipped = a !== action.x;
      return {
        ...state,
        results: {
          ...state.results,
          [matchKey(a, b)]: {
            a, b,
            scoreA: flipped ? action.scoreY : action.scoreX,
            scoreB: flipped ? action.scoreX : action.scoreY,
            playedOn: action.playedOn,
          },
        },
      };
    }

    case "clearResult": {
      const results = { ...state.results };
      delete results[matchKey(action.x, action.y)];
      return { ...state, results };
    }

    case "replace":
      return action.league;

    case "reset":
      return emptyLeague();
  }
}
