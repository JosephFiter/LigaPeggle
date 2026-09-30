import { winnerOf } from "../../domain/standings";
import type { Match } from "../../domain/types";
import { useLeague } from "../../state/LeagueContext";
import { formatScore, PlayerTag } from "../../components/ui/ui";

/** Tarjeta de un cruce. Sin `onOpen` (modo lectura) no es clickeable. */
export function MatchCard({ match, onOpen }: { match: Match; onOpen?: (m: Match) => void }) {
  const { playerById } = useLeague();
  const a = playerById(match.a)!;
  const b = playerById(match.b)!;
  const r = match.result;
  const winner = r ? winnerOf(r) : undefined;

  const side = (id: string) =>
    !r ? "" : winner === null ? "is-draw" : winner === id ? "is-winner" : "is-loser";

  return (
    <button
      className={`match ${r ? "match--played" : "match--pending"}`}
      onClick={onOpen && (() => onOpen(match))}
      disabled={!onOpen}
      title={onOpen ? (r ? "Editar resultado" : "Cargar resultado") : undefined}
    >
      <span className={`match__side ${side(a.id)}`}>
        <PlayerTag player={a} size="sm" />
        {r && <span className="match__score">{formatScore(r.scoreA)}</span>}
      </span>
      <span className="match__vs">{r ? (winner === null ? "=" : "✓") : "VS"}</span>
      <span className={`match__side match__side--right ${side(b.id)}`}>
        {r && <span className="match__score">{formatScore(r.scoreB)}</span>}
        <PlayerTag player={b} size="sm" />
      </span>
    </button>
  );
}
