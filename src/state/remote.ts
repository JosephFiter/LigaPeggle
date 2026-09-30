import type { League } from "../domain/types";
import { emptyLeague, parseLeague } from "./storage";

const ENDPOINT = "/api/league";
const PASSWORD_KEY = "liga-peggle:admin-password";

async function errorMessage(res: Response): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.error ?? `Error ${res.status}`;
}

/** Trae la liga guardada. Si todavía no hay nada guardado, devuelve una liga vacía. */
export async function fetchLeague(): Promise<League> {
  const res = await fetch(ENDPOINT, { cache: "no-store" });
  if (!res.ok) throw new Error(await errorMessage(res));
  const text = await res.text();
  try {
    return parseLeague(text);
  } catch {
    return emptyLeague();
  }
}

export async function pushLeague(league: League, password: string): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin-password": password },
    body: JSON.stringify(league),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
}

export async function verifyPassword(password: string): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
}

/** La contraseña se recuerda en este navegador para no pedirla cada vez. */
export const savedPassword = {
  get(): string | null {
    try { return localStorage.getItem(PASSWORD_KEY); } catch { return null; }
  },
  set(pw: string | null) {
    try {
      if (pw) localStorage.setItem(PASSWORD_KEY, pw);
      else localStorage.removeItem(PASSWORD_KEY);
    } catch { /* sin storage: se pide de nuevo la próxima vez */ }
  },
};
