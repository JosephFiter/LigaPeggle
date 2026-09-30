import { useState } from "react";
import { allMatches, involves, opponentOf } from "../../domain/fixture";
import { masterById } from "../../domain/masters";
import type { Player } from "../../domain/types";
import { useLeague } from "../../state/LeagueContext";
import { Avatar, EmptyState, Modal, Panel, PegButton } from "../../components/ui/ui";
import { PlayerForm } from "./PlayerForm";
import "./players.css";

export function PlayersView() {
  const { league, dispatch, standings, playerById, isAdmin } = useLeague();
  const [editing, setEditing] = useState<Player | null>(null);
  const matches = allMatches(league);
  const names = league.players.map((p) => p.name.toLowerCase());

  const remove = (p: Player) => {
    const played = Object.values(league.results).filter((r) => r.a === p.id || r.b === p.id).length;
    const msg = played
      ? `¿Eliminar a ${p.name}? Se borrarán sus ${played} resultado(s) cargados.`
      : `¿Eliminar a ${p.name}?`;
    if (confirm(msg)) dispatch({ type: "removePlayer", id: p.id });
  };

  return (
    <div className="players-view">
      {isAdmin && (
        <Panel title="Agregar jugador">
          <PlayerForm
            submitLabel="Agregar"
            takenNames={names}
            onSubmit={(v) => dispatch({ type: "addPlayer", ...v })}
          />
          {Object.keys(league.results).length > 0 && (
            <p className="muted players-view__note">
              Ojo: si agregás o sacás jugadores con la liga empezada, se reacomodan las fechas (los resultados cargados se mantienen).
            </p>
          )}
        </Panel>
      )}

      <Panel title={`Jugadores (${league.players.length})`}>
        {league.players.length === 0 ? (
          <EmptyState emoji="🎯" title="Todavía no hay jugadores">{isAdmin && "Agregá a tus amigos arriba."}</EmptyState>
        ) : (
          <div className="player-cards">
            {league.players.map((p) => {
              const row = standings.find((s) => s.player.id === p.id)!;
              const pos = standings.indexOf(row) + 1;
              const pending = matches
                .filter((m) => !m.result && involves(m, p.id))
                .map((m) => playerById(opponentOf(m, p.id))!);
              const total = league.players.length - 1;
              return (
                <article key={p.id} className="player-card">
                  <header className="player-card__header">
                    <Avatar player={p} size="lg" />
                    <div className="player-card__id">
                      <h3>{p.name}</h3>
                      <span className="muted">{masterById(p.masterId).name}</span>
                    </div>
                    <div className="player-card__pos" title="Posición en la tabla">#{pos}</div>
                  </header>

                  <dl className="player-card__stats">
                    <div><dt>Pts</dt><dd>{row.points}</dd></div>
                    <div><dt>Jugados</dt><dd>{row.played}/{total}</dd></div>
                    <div><dt>G-E-P</dt><dd>{row.won}-{row.drawn}-{row.lost}</dd></div>
                  </dl>

                  <div className="player-card__pending">
                    {pending.length === 0 ? (
                      <span className="player-card__done">✓ Jugó contra todos</span>
                    ) : (
                      <>
                        <span className="muted">Le falta jugar contra ({pending.length}):</span>
                        <ul>
                          {pending.map((o) => (
                            <li key={o.id} className="chip">
                              <Avatar player={o} size="sm" /> {o.name}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>

                  {isAdmin && (
                    <footer className="player-card__actions">
                      <PegButton variant="ghost" onClick={() => setEditing(p)}>Editar</PegButton>
                      <PegButton variant="ghost" onClick={() => remove(p)}>Eliminar</PegButton>
                    </footer>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Panel>

      {editing && (
        <Modal title={`Editar a ${editing.name}`} onClose={() => setEditing(null)}>
          <PlayerForm
            initial={{ name: editing.name, masterId: editing.masterId }}
            submitLabel="Guardar"
            takenNames={names.filter((n) => n !== editing.name.toLowerCase())}
            onCancel={() => setEditing(null)}
            onSubmit={(v) => {
              dispatch({ type: "updatePlayer", id: editing.id, ...v });
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
