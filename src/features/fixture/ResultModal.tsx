import { useState, type FormEvent } from "react";
import type { Match } from "../../domain/types";
import { useLeague } from "../../state/LeagueContext";
import { Modal, PegButton, PlayerTag } from "../../components/ui/ui";

const today = () => new Date().toISOString().slice(0, 10);

export function ResultModal({ match, onClose }: { match: Match; onClose: () => void }) {
  const { dispatch, playerById } = useLeague();
  const a = playerById(match.a)!;
  const b = playerById(match.b)!;
  const [scoreA, setScoreA] = useState(match.result?.scoreA.toString() ?? "");
  const [scoreB, setScoreB] = useState(match.result?.scoreB.toString() ?? "");
  const [playedOn, setPlayedOn] = useState(match.result?.playedOn ?? today());

  const parse = (v: string) => (v.trim() === "" ? NaN : Number(v.replace(/\D/g, "")));
  const nA = parse(scoreA);
  const nB = parse(scoreB);
  const valid = Number.isFinite(nA) && Number.isFinite(nB);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    dispatch({ type: "setResult", x: a.id, y: b.id, scoreX: nA, scoreY: nB, playedOn: playedOn || undefined });
    onClose();
  };

  const clear = () => {
    dispatch({ type: "clearResult", x: a.id, y: b.id });
    onClose();
  };

  const verdict = !valid ? null : nA === nB ? "Empate" : `Gana ${nA > nB ? a.name : b.name}`;

  return (
    <Modal title={match.result ? "Editar resultado" : "Cargar resultado"} onClose={onClose}>
      <form className="result-form" onSubmit={submit}>
        {[
          { player: a, value: scoreA, set: setScoreA },
          { player: b, value: scoreB, set: setScoreB },
        ].map(({ player, value, set }, i) => (
          <label key={player.id} className="result-form__row">
            <PlayerTag player={player} />
            <input
              inputMode="numeric"
              placeholder="Puntaje"
              value={value}
              onChange={(e) => set(e.target.value)}
              autoFocus={i === 0}
              aria-label={`Puntaje de ${player.name}`}
            />
          </label>
        ))}

        <label className="result-form__row">
          <span className="muted">Fecha jugada</span>
          <input type="date" value={playedOn} onChange={(e) => setPlayedOn(e.target.value)} />
        </label>

        <p className="result-form__verdict">{verdict ?? " "}</p>

        <div className="result-form__actions">
          {match.result && (
            <PegButton type="button" variant="danger" onClick={clear}>Borrar</PegButton>
          )}
          <PegButton type="button" variant="ghost" onClick={onClose}>Cancelar</PegButton>
          <PegButton type="submit" variant="green" disabled={!valid}>Guardar</PegButton>
        </div>
      </form>
    </Modal>
  );
}
