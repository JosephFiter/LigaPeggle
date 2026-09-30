import type { ReactNode } from "react";
import type { MatchResult } from "../../domain/types";
import { useLeague } from "../../state/LeagueContext";
import { EmptyState, formatScore, Panel, PlayerTag } from "../../components/ui/ui";
import "./stats.css";

export function StatsView() {
  const { stats, standings, playerById } = useLeague();

  if (stats.played === 0) {
    return (
      <Panel title="Estadísticas">
        <EmptyState emoji="📊" title="Sin partidos jugados">Cargá resultados para ver las estadísticas.</EmptyState>
      </Panel>
    );
  }

  const describe = (r: MatchResult) =>
    `${playerById(r.a)?.name} ${formatScore(r.scoreA)} – ${formatScore(r.scoreB)} ${playerById(r.b)?.name}`;

  const leader = standings[0];
  const mostPending = [...standings].sort((x, y) => y.pending - x.pending)[0];
  const hs = stats.highestScore!;
  const bw = stats.biggestWin;
  const cm = stats.closestMatch!;

  return (
    <Panel title="Estadísticas">
      <div className="stats">
        <StatCard color="orange" label="Puntero" value={<PlayerTag player={leader.player} />} note={`${leader.points} pts`} />
        <StatCard
          color="blue"
          label="Récord de puntaje"
          value={formatScore(hs.score)}
          note={<>por <strong>{playerById(hs.playerId)?.name}</strong></>}
        />
        {bw && (
          <StatCard
            color="green"
            label="Paliza más grande"
            value={`+${formatScore(bw.margin)}`}
            note={describe(bw.result)}
          />
        )}
        <StatCard color="purple" label="Partido más parejo" value={`±${formatScore(cm.margin)}`} note={describe(cm.result)} />
        <StatCard color="blue" label="Puntaje promedio" value={formatScore(stats.averageScore)} note="por jugador por partido" />
        <StatCard
          color="orange"
          label="Avance de la liga"
          value={`${stats.played}/${stats.total}`}
          note={mostPending.pending > 0 ? <>Más atrasado: <strong>{mostPending.player.name}</strong> ({mostPending.pending})</> : "¡Liga terminada!"}
        />
      </div>
    </Panel>
  );
}

function StatCard({ label, value, note, color }: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  color: "orange" | "blue" | "green" | "purple";
}) {
  return (
    <div className={`stat stat--${color}`}>
      <span className="stat__label">{label}</span>
      <span className="stat__value">{value}</span>
      {note && <span className="stat__note">{note}</span>}
    </div>
  );
}
