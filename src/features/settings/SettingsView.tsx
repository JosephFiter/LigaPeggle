import { useRef, useState } from "react";
import { useLeague } from "../../state/LeagueContext";
import { downloadLeague, parseLeague } from "../../state/storage";
import { Panel, PegButton } from "../../components/ui/ui";
import "./settings.css";

export function SettingsView() {
  const { league, dispatch } = useLeague();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

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
    if (confirm("¿Borrar toda la liga? Esto no se puede deshacer (salvo que tengas un backup exportado).")) {
      dispatch({ type: "reset" });
      setMessage({ kind: "ok", text: "Liga reiniciada." });
    }
  };

  return (
    <div className="settings">
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
          Los datos se guardan en este navegador. Exportá un backup para pasárselo a tus amigos o moverlo a otra compu.
        </p>
        <div className="settings__actions">
          <PegButton variant="blue" onClick={() => downloadLeague(league)}>⬇ Exportar JSON</PegButton>
          <PegButton variant="blue" onClick={() => fileRef.current?.click()}>⬆ Importar JSON</PegButton>
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
    </div>
  );
}
