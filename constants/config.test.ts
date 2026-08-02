import { LEVEL_TITLES, XP_CURVE, levelFromXp } from "./config";

describe("levelFromXp", () => {
  it("starts at level 1 with 0 XP", () => {
    const result = levelFromXp(0);
    expect(result.level).toBe(1);
    expect(result.title).toBe(LEVEL_TITLES[0]);
    expect(result.progress).toBe(0);
  });

  it("advances to the next level exactly at its XP threshold", () => {
    const result = levelFromXp(XP_CURVE[1]);
    expect(result.level).toBe(2);
    expect(result.progress).toBe(0);
  });

  it("reports partial progress toward the next level", () => {
    const midpoint = (XP_CURVE[0] + XP_CURVE[1]) / 2;
    const result = levelFromXp(midpoint);
    expect(result.level).toBe(1);
    expect(result.progress).toBeCloseTo(0.5, 5);
  });

  it("caps at the final level for XP beyond the curve", () => {
    const result = levelFromXp(XP_CURVE[XP_CURVE.length - 1] + 100_000);
    expect(result.level).toBe(XP_CURVE.length);
    expect(result.title).toBe(LEVEL_TITLES[LEVEL_TITLES.length - 1]);
    expect(result.progress).toBeLessThanOrEqual(1);
  });
});
