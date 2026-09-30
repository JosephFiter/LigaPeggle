import type { League } from "../domain/types";

export const emptyLeague = (): League => ({ name: "Liga Peggle", players: [], results: {} });

/** Valida y normaliza un JSON de liga (usado al cargar y al importar). */
export function parseLeague(raw: string): League {
  const data = JSON.parse(raw);
  if (!data || typeof data !== "object" || !Array.isArray(data.players)) {
    throw new Error("El archivo no tiene el formato de una liga.");
  }
  const players = data.players
    .filter((p: unknown): p is { id: string; name: string; masterId?: string } =>
      !!p && typeof (p as any).id === "string" && typeof (p as any).name === "string")
    .map((p: { id: string; name: string; masterId?: string }) => ({
      id: p.id, name: p.name, masterId: p.masterId ?? "bjorn",
    }));
  const ids = new Set(players.map((p: { id: string }) => p.id));
  const results: League["results"] = {};
  for (const [key, r] of Object.entries<any>(data.results ?? {})) {
    if (ids.has(r?.a) && ids.has(r?.b) && Number.isFinite(r.scoreA) && Number.isFinite(r.scoreB)) {
      results[key] = { a: r.a, b: r.b, scoreA: r.scoreA, scoreB: r.scoreB, playedOn: r.playedOn };
    }
  }
  return { name: typeof data.name === "string" ? data.name : "Liga Peggle", players, results };
}

export function downloadLeague(league: League): void {
  const blob = new Blob([JSON.stringify(league, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "liga.json";
  a.click();
  URL.revokeObjectURL(url);
}
