import { useMemo } from "react";
import { useLeague } from "../../state/LeagueContext";
import { FeverMeter } from "../ui/ui";
import "./layout.css";

export interface TabDef<T extends string> {
  id: T;
  label: string;
  icon: string;
  badge?: number;
}

export function Header() {
  const { league, rounds } = useLeague();
  const matches = rounds.flatMap((r) => r.matches);
  const played = matches.filter((m) => m.result).length;

  return (
    <header className="app-header">
      <div className="app-header__logo">
        <span className="app-header__ball" aria-hidden />
        <h1 className="title-text">{league.name}</h1>
      </div>
      {matches.length > 0 && (
        <div className="app-header__meter">
          <FeverMeter value={played} total={matches.length} label={`${played} de ${matches.length} partidos jugados`} />
        </div>
      )}
    </header>
  );
}

export function TabBar<T extends string>({ tabs, active, onChange }: {
  tabs: TabDef<T>[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <nav className="tabbar" aria-label="Secciones">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`tabbar__tab ${t.id === active ? "is-active" : ""}`}
          aria-current={t.id === active ? "page" : undefined}
          onClick={() => onChange(t.id)}
        >
          <span className="tabbar__icon" aria-hidden>{t.icon}</span>
          <span className="tabbar__label">{t.label}</span>
          {!!t.badge && <span className="tabbar__badge">{t.badge}</span>}
        </button>
      ))}
    </nav>
  );
}

const PEG_COLORS = ["var(--peg-blue)", "var(--peg-blue)", "var(--peg-blue)", "var(--peg-orange)", "var(--peg-green)", "var(--peg-purple)"];

/** Fondo decorativo con pegs flotando, generado de forma determinística. */
export function PegBackground() {
  const pegs = useMemo(() => {
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    return Array.from({ length: 38 }, (_, i) => ({
      x: rand() * 100,
      y: rand() * 100,
      r: 5 + rand() * 9,
      color: PEG_COLORS[Math.floor(rand() * PEG_COLORS.length)],
      brick: rand() > 0.75,
      delay: -rand() * 8,
      key: i,
    }));
  }, []);

  return (
    <div className="peg-bg" aria-hidden>
      {pegs.map((p) => (
        <span
          key={p.key}
          className={`peg-bg__peg ${p.brick ? "is-brick" : ""}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.brick ? p.r * 3 : p.r * 2,
            height: p.r * 2,
            background: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
