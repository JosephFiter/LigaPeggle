import { useEffect, useState } from "react";
import { Header, PegBackground, TabBar, type TabDef } from "./components/layout/layout";
import { FixtureView } from "./features/fixture/FixtureView";
import { PlayersView } from "./features/players/PlayersView";
import { SettingsView } from "./features/settings/SettingsView";
import { StandingsView } from "./features/standings/StandingsView";
import { StatsView } from "./features/stats/StatsView";
import { useLeague } from "./state/LeagueContext";
import "./App.css";

type TabId = "fixture" | "tabla" | "jugadores" | "stats" | "ajustes";
const TAB_IDS: TabId[] = ["fixture", "tabla", "jugadores", "stats", "ajustes"];

/** Pestaña activa sincronizada con el hash de la URL (#tabla, #jugadores, ...). */
function useHashTab(fallback: TabId): [TabId, (t: TabId) => void] {
  const read = () => {
    const h = window.location.hash.slice(1) as TabId;
    return TAB_IDS.includes(h) ? h : fallback;
  };
  const [tab, setTab] = useState<TabId>(read);
  useEffect(() => {
    const onHash = () => setTab(read());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  });
  return [tab, (t) => (window.location.hash = t)];
}

export default function App() {
  const { league, rounds } = useLeague();
  const [tab, setTab] = useHashTab(league.players.length < 2 ? "jugadores" : "fixture");
  const pending = rounds.reduce((n, r) => n + r.matches.filter((m) => !m.result).length, 0);

  const tabs: TabDef<TabId>[] = [
    { id: "fixture", label: "Partidos", icon: "🎯", badge: pending },
    { id: "tabla", label: "Tabla", icon: "🏆" },
    { id: "jugadores", label: "Jugadores", icon: "🦄", badge: league.players.length },
    { id: "stats", label: "Stats", icon: "📊" },
    { id: "ajustes", label: "Ajustes", icon: "⚙️" },
  ];

  return (
    <>
      <PegBackground />
      <div className="app">
        <Header />
        <TabBar tabs={tabs} active={tab} onChange={setTab} />
        <main>
          {tab === "fixture" && <FixtureView onGoToPlayers={() => setTab("jugadores")} />}
          {tab === "tabla" && <StandingsView />}
          {tab === "jugadores" && <PlayersView />}
          {tab === "stats" && <StatsView />}
          {tab === "ajustes" && <SettingsView />}
        </main>
        <footer className="app__footer muted">Hecho con 🦄 para los Peggle Masters del grupo</footer>
      </div>
    </>
  );
}
