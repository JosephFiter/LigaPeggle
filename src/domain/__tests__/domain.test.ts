import { describe, expect, it } from "vitest";
import { allMatches, buildRounds, matchKey } from "../fixture";
import { computeStandings } from "../standings";
import type { League } from "../types";

const league = (n: number, results: League["results"] = {}): League => ({
  name: "Test",
  players: Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `P${i}`, masterId: "bjorn" })),
  results,
});

describe("fixture", () => {
  it.each([2, 3, 4, 5, 8, 9])("con %i jugadores cada par se cruza exactamente una vez", (n) => {
    const matches = allMatches(league(n));
    expect(matches).toHaveLength((n * (n - 1)) / 2);
    expect(new Set(matches.map((m) => m.key)).size).toBe(matches.length);
  });

  it("nadie juega dos veces en la misma fecha", () => {
    for (const round of buildRounds(league(7))) {
      const ids = round.matches.flatMap((m) => [m.a, m.b]);
      expect(new Set(ids).size).toBe(ids.length);
      expect(round.bye).toBeDefined();
    }
  });
});

describe("standings", () => {
  it("suma puntos y ordena por puntos y diferencia", () => {
    const l = league(3, {
      [matchKey("p0", "p1")]: { a: "p0", b: "p1", scoreA: 100_000, scoreB: 50_000 },
      [matchKey("p1", "p2")]: { a: "p1", b: "p2", scoreA: 70_000, scoreB: 70_000 },
    });
    const [first, second, third] = computeStandings(l);
    expect(first.player.id).toBe("p0");
    expect(first.points).toBe(3);
    expect(first.pending).toBe(1);
    expect(second.player.id).toBe("p2");
    expect(second.points).toBe(1);
    expect(third.player.id).toBe("p1");
    expect(third.scoreDiff).toBe(-50_000);
  });
});
