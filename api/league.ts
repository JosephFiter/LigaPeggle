/**
 * API de la liga (función serverless de Vercel).
 *
 *   GET  /api/league  -> devuelve el JSON de la liga (público)
 *   PUT  /api/league  -> guarda el JSON (requiere header x-admin-password)
 *   POST /api/league  -> verifica la contraseña de admin ({ password })
 *
 * El JSON vive en jsonbin.io. Variables de entorno:
 *   JSONBIN_BIN_ID, JSONBIN_MASTER_KEY, ADMIN_PASSWORD
 * Sin las de jsonbin (desarrollo local) se usa el archivo .data/league.json.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const MAX_BYTES = 200_000;
const JSONBIN = "https://api.jsonbin.io/v3/b";
const LOCAL_FILE = ".data/league.json";

interface Store {
  read(): Promise<unknown>;
  write(data: unknown): Promise<void>;
}

const jsonbinStore = (binId: string, key: string): Store => ({
  async read() {
    const res = await fetch(`${JSONBIN}/${binId}/latest`, {
      headers: { "X-Master-Key": key, "X-Bin-Meta": "false" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`jsonbin respondió ${res.status}`);
    return res.json();
  },
  async write(data) {
    const res = await fetch(`${JSONBIN}/${binId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Master-Key": key },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`jsonbin respondió ${res.status}`);
  },
});

const fileStore: Store = {
  async read() {
    try {
      return JSON.parse(await readFile(LOCAL_FILE, "utf8"));
    } catch {
      return {};
    }
  },
  async write(data) {
    await mkdir(".data", { recursive: true });
    await writeFile(LOCAL_FILE, JSON.stringify(data, null, 2));
  },
};

function getStore(): Store {
  const { JSONBIN_BIN_ID, JSONBIN_MASTER_KEY, VERCEL } = process.env;
  if (JSONBIN_BIN_ID && JSONBIN_MASTER_KEY) return jsonbinStore(JSONBIN_BIN_ID, JSONBIN_MASTER_KEY);
  if (VERCEL) throw new Error("Faltan JSONBIN_BIN_ID / JSONBIN_MASTER_KEY en Vercel.");
  return fileStore;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const sha = (s: string) => createHash("sha256").update(s).digest();

function passwordOk(given: string | null | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !given) return false;
  return timingSafeEqual(sha(given), sha(expected));
}

/** Validación mínima de la forma de la liga antes de guardarla. */
function isLeague(data: any): boolean {
  return (
    !!data && typeof data === "object" &&
    typeof data.name === "string" &&
    Array.isArray(data.players) &&
    data.players.every((p: any) => typeof p?.id === "string" && typeof p?.name === "string") &&
    !!data.results && typeof data.results === "object" &&
    Object.values(data.results).every(
      (r: any) => typeof r?.a === "string" && typeof r?.b === "string" &&
        Number.isFinite(r?.scoreA) && Number.isFinite(r?.scoreB),
    )
  );
}

const fail = (e: unknown) => json({ error: e instanceof Error ? e.message : "Error inesperado" }, 500);

export async function GET(): Promise<Response> {
  try {
    return json(await getStore().read());
  } catch (e) {
    return fail(e);
  }
}

export async function PUT(request: Request): Promise<Response> {
  if (!passwordOk(request.headers.get("x-admin-password"))) {
    return json({ error: "Contraseña incorrecta" }, 401);
  }
  const text = await request.text();
  if (text.length > MAX_BYTES) return json({ error: "La liga es demasiado grande" }, 413);
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }
  if (!isLeague(data)) return json({ error: "El JSON no tiene el formato de una liga" }, 400);
  try {
    await getStore().write(data);
    return json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as { password?: string };
  if (!process.env.ADMIN_PASSWORD) return json({ error: "Falta ADMIN_PASSWORD en el servidor" }, 500);
  return passwordOk(body?.password) ? json({ ok: true }) : json({ error: "Contraseña incorrecta" }, 401);
}
