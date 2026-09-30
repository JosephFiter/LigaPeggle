import { useRef, useState, type FormEvent } from "react";
import { useLeague } from "../../state/LeagueContext";
import { downloadLeague, parseLeague } from "../../state/storage";
import { Panel, PegButton } from "../../components/ui/ui";
import "./settings.css";

type Message = { kind: "ok" | "error"; text: string } | null;

export function SettingsView() {
  const { isAdmin } = useLeague();
  return <div className="settings">{isAdmin ? <AdminSettings /> : <LoginPanel />}</div>;
}

function LoginPanel() {
  const { login } = useLeague();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo entrar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Entrar como admin">
      <p className="muted settings__text">
        Cualquiera puede ver la liga. Para cargar resultados o jugadores hace falta la contraseña de admin.
      </p>
      <form className="settings__login" onSubmit={submit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoComplete="current-password"
          aria-label="Contraseña de admin"
        />
        <PegButton type="submit" variant="green" disabled={!password || busy}>
          {busy ? "Entrando…" : "Entrar"}
        </PegButton>
      </form>
      {error && <p className="settings__msg settings__msg--error">{error}</p>}
    </Panel>
  );
}

function AdminSettings() {
  const { league, dispatch, logout } = useLeague();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<Message>(null);

  const importFile = async (file: File) => {
    try {
      const imported = parseLeague(await file.text());
      if (!confirm(`¿Reemplazar la liga actual por "${imported.name}" (${imported.players.length} jugadores)?`)) return;
      dispatch({ type: "replace", league: imported });
      setMessage({ kind: "ok", text: "Liga importada." });
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "No se pudo leer el archivo." });
    }
  };

  const reset = () => {
    if (confirm("¿Borrar toda la liga para todos? Esto no se puede deshacer (salvo que tengas un backup).")) {
      dispatch({ type: "reset" });
      setMessage({ kind: "ok", text: "Liga reiniciada." });
    }
  };

  return (
    <>
      <Panel title="Nombre de la liga">
        <input
          className="settings__name"
          value={league.name}
          maxLength={40}
          onChange={(e) => dispatch({ type: "renameLeague", name: e.target.value })}
          aria-label="Nombre de la liga"
        />
      </Panel>

      <Panel title="Datos">
        <p className="muted settings__text">
          Todo lo que cambies se guarda solo en el servidor y lo ven todos. El backup es opcional, por si algo sale mal.
        </p>
        <div className="settings__actions">
          <PegButton variant="blue" onClick={() => downloadLeague(league)}>⬇ Descargar backup</PegButton>
          <PegButton variant="blue" onClick={() => fileRef.current?.click()}>⬆ Restaurar backup</PegButton>
          <PegButton variant="danger" onClick={reset}>Reiniciar liga</PegButton>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importFile(f);
              e.target.value = "";
            }}
          />
        </div>
        {message && <p className={`settings__msg settings__msg--${message.kind}`}>{message.text}</p>}
      </Panel>

      <Panel title="Sesión">
        <div className="settings__actions">
          <PegButton variant="ghost" onClick={logout}>Salir del modo admin</PegButton>
        </div>
      </Panel>
    </>
  );
}
