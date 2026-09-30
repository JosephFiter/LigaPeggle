import { useState } from "react";
import { involves } from "../../domain/fixture";
import type { Match } from "../../domain/types";
import { useLeague } from "../../state/LeagueContext";
import { EmptyState, Panel, PlayerTag, Segmented } from "../../components/ui/ui";
import { MatchCard } from "./MatchCard";
import { ResultModal } from "./ResultModal";
import "./fixture.css";

type StatusFilter = "pending" | "played" | "all";

export function FixtureView({ onGoToPlayers }: { onGoToPlayers: () => void }) {
  const { rounds, league, playerById } = useLeague();
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [playerId, setPlayerId] = useState("");
  const [editing, setEditing] = useState<Match | null>(null);

  if (league.players.length < 2) {
    return (
      <Panel>
        <EmptyState title="¡Faltan jugadores!">
          <p>Cargá al menos dos jugadores para armar el fixture.</p>
          <button className="peg-btn peg-btn--orange" onClick={onGoToPlayers}>Agregar jugadores</button>
        </EmptyState>
      </Panel>
    );
  }

  const matchesFilter = (m: Match) =>
    (status === "all" || (status === "played") === !!m.result) &&
    (!playerId || involves(m, playerId));

  const visible = rounds
    .map((r) => ({ ...r, shown: r.matches.filter(matchesFilter) }))
    .filter((r) => r.shown.length > 0);

  return (
    <>
      <Panel
        title="Enfrentamientos"
        actions={
          <>
            <Segmented<StatusFilter>
              value={status}
              onChange={setStatus}
              options={[
                { value: "pending", label: "Faltan" },
                { value: "played", label: "Jugados" },
                { value: "all", label: "Todos" },
              ]}
            />
            <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} aria-label="Filtrar por jugador">
              <option value="">Todos los jugadores</option>
              {league.players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </>
        }
      >
        {visible.length === 0 ? (
          <EmptyState
            emoji={status === "pending" ? "🌈" : "🎯"}
            title={status === "pending" ? "¡No falta ningún partido!" : "Todavía no hay partidos jugados"}
          >
            {status === "pending" ? "Ya se jugó todo lo de este filtro. ¡Extreme Fever!" : "Tocá un enfrentamiento pendiente para cargar el resultado."}
          </EmptyState>
        ) : (
          <div className="rounds">
            {visible.map((round) => {
              const done = round.matches.filter((m) => m.result).length;
              const bye = round.bye && playerById(round.bye);
              return (
                <article key={round.number} className={`round ${done === round.matches.length ? "round--done" : ""}`}>
                  <header className="round__header">
                    <h3>Fecha {round.number}</h3>
                    <span className="round__count">{done}/{round.matches.length}</span>
                  </header>
                  <div className="round__matches">
                    {round.shown.map((m) => (
                      <MatchCard key={m.key} match={m} onOpen={setEditing} />
                    ))}
                  </div>
                  {bye && !playerId && (
                    <footer className="round__bye">
                      Libre: <PlayerTag player={bye} size="sm" />
                    </footer>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Panel>

      {editing && <ResultModal match={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
