export interface PeggleMaster {
  id: string;
  name: string;
  emoji: string;
  power: string;
  color: string;
}

/** Los Peggle Masters, usados como avatares de los jugadores. */
export const MASTERS: PeggleMaster[] = [
  { id: "bjorn", name: "Bjorn", emoji: "🦄", power: "Super Guide", color: "#ff7ac8" },
  { id: "jimmy", name: "Jimmy Lightning", emoji: "🐹", power: "Multiball", color: "#ffb13b" },
  { id: "kattut", name: "Kat Tut", emoji: "🐱", power: "Pyramid", color: "#e8c64a" },
  { id: "splork", name: "Splork", emoji: "👽", power: "Space Blast", color: "#7be05a" },
  { id: "claude", name: "Claude", emoji: "🦞", power: "Flippers", color: "#ff5a4e" },
  { id: "renfield", name: "Renfield", emoji: "🎃", power: "Spooky Ball", color: "#ff8a1f" },
  { id: "tula", name: "Tula", emoji: "🌻", power: "Flower Power", color: "#ffd83a" },
  { id: "warren", name: "Warren", emoji: "🎩", power: "Lucky Spin", color: "#b08cff" },
  { id: "cinderbottom", name: "Lord Cinderbottom", emoji: "🔥", power: "Fireball", color: "#ff4a2a" },
  { id: "hu", name: "Master Hu", emoji: "🦉", power: "Zen Ball", color: "#5ad1ff" },
];

export const masterById = (id: string): PeggleMaster =>
  MASTERS.find((m) => m.id === id) ?? MASTERS[0];
