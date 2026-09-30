import { useLeague } from "../../state/LeagueContext";
import { EmptyState, formatScore, Panel, PlayerTag } from "../../components/ui/ui";
import { RULES } from "../../domain/rules";
import "./standings.css";

const MEDALS = ["🥇", "🥈", "🥉"];
const FORM_LABEL = { W: "G", D: "E", L: "P" } as const;

export function StandingsView() {
  const { standings } = useLeague();

  if (standings.length === 0) {
    return (
      <Panel title="Tabla de posiciones">
        <EmptyState emoji="🏆" title="Sin jugadores todavía" />
      </Panel>
    );
  }

  const signed = (n: number) => (n > 0 ? `+${formatScore(n)}` : formatScore(n));

  return (
    <Panel title="Tabla de posiciones">
      <div className="table-scroll">
        <table className="standings">
          <thead>
            <tr>
              <th>#</th>
              <th className="standings__player">Jugador</th>
              <th title="Puntos">Pts</th>
              <th title="Partidos jugados">PJ</th>
              <th title="Ganados">G</th>
              <th title="Empatados">E</th>
              <th title="Perdidos">P</th>
              <th title="Partidos que le faltan">Faltan</th>
              <th title="Score a favor">Score +</th>
              <th title="Score en contra">Score −</th>
              <th title="Diferencia de score">Dif</th>
              <th title="Mejor puntaje en un partido">Mejor</th>
              <th>Racha</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr key={row.player.id} className={i < 3 && row.played > 0 ? `is-top is-top-${i + 1}` : ""}>
                <td className="standings__pos">{row.played > 0 && MEDALS[i] ? MEDALS[i] : i + 1}</td>
                <td className="standings__player"><PlayerTag player={row.player} size="sm" /></td>
                <td className="standings__pts">{row.points}</td>
                <td>{row.played}</td>
                <td>{row.won}</td>
                <td>{row.drawn}</td>
                <td>{row.lost}</td>
                <td className={row.pending ? "standings__pending" : "muted"}>{row.pending}</td>
                <td>{formatScore(row.scoreFor)}</td>
                <td>{formatScore(row.scoreAgainst)}</td>
                <td className={row.scoreDiff > 0 ? "pos" : row.scoreDiff < 0 ? "neg" : ""}>{signed(row.scoreDiff)}</td>
                <td>{row.bestScore ? formatScore(row.bestScore) : "—"}</td>
                <td>
                  <span className="form">
                    {row.form.map((f, j) => (
                      <span key={j} className={`form__peg form__peg--${f}`} title={FORM_LABEL[f]}>{FORM_LABEL[f]}</span>
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="standings__legend muted">
        Victoria {RULES.pointsWin} pts · Empate {RULES.pointsDraw} pt · Desempate: diferencia de score, score a favor, enfrentamiento directo.
      </p>
    </Panel>
  );
}
