import { BASELINE, BASE_SCENARIO, projectAgainstBaseline } from "./simulate";

describe("projectAgainstBaseline", () => {
  it("has zero delta for the untouched baseline scenario", () => {
    const result = projectAgainstBaseline(BASE_SCENARIO);
    expect(result.delta).toBe(0);
    expect(result.finalValue).toBe(BASELINE.finalValue);
  });

  it("returns 13 points: today plus 12 months", () => {
    const result = projectAgainstBaseline(BASE_SCENARIO);
    expect(result.points).toHaveLength(13);
  });

  it("cutting coffee spend only ever helps or matches the baseline", () => {
    const result = projectAgainstBaseline({ ...BASE_SCENARIO, coffeeCut: 100 });
    expect(result.finalValue).toBeGreaterThanOrEqual(BASELINE.finalValue);
    expect(result.delta).toBeGreaterThanOrEqual(0);
  });

  it("raising rent only ever hurts or matches the baseline", () => {
    const result = projectAgainstBaseline({ ...BASE_SCENARIO, rentDelta: 30 });
    expect(result.finalValue).toBeLessThanOrEqual(BASELINE.finalValue);
    expect(result.delta).toBeLessThanOrEqual(0);
  });

  it("adding a side hustle only ever helps or matches the baseline", () => {
    const result = projectAgainstBaseline({ ...BASE_SCENARIO, sideHustle: 10000 });
    expect(result.finalValue).toBeGreaterThanOrEqual(BASELINE.finalValue);
  });

  it("reports a break-even month once outgoings force the balance negative", () => {
    const result = projectAgainstBaseline({
      ...BASE_SCENARIO,
      rentDelta: 30,
      sideHustle: -1_000_000, // scenario type allows any number; forces a large deficit
    });
    expect(result.breakEvenMonth).not.toBeNull();
    expect(result.breakEvenMonth).toBeGreaterThanOrEqual(1);
    expect(result.breakEvenMonth).toBeLessThanOrEqual(12);
  });

  it("reports no break-even month when the balance stays positive throughout", () => {
    const result = projectAgainstBaseline(BASE_SCENARIO);
    expect(result.breakEvenMonth).toBeNull();
  });
});
