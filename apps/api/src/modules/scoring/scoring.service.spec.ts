import { ScoringService } from "./scoring.service";
import type { ScoringConfig } from "../journeys/journey-config.types";

const config: ScoringConfig = {
  strategy: "correct-count",
  totalQuestions: 6,
  profiles: [
    { min: 0, max: 1, profile: "Just Getting Started" },
    { min: 2, max: 3, profile: "Curious Learner" },
    { min: 4, max: 4, profile: "Bone Aware" },
    { min: 5, max: 5, profile: "Bone Smart" },
    { min: 6, max: 6, profile: "Bone Health Champion" },
  ],
};

describe("ScoringService (correct-count)", () => {
  const service = new ScoringService();

  it.each([
    [0, 6, "Just Getting Started"],
    [1, 5, "Just Getting Started"],
    [2, 4, "Curious Learner"],
    [3, 3, "Curious Learner"],
    [4, 2, "Bone Aware"],
    [5, 1, "Bone Smart"],
    [6, 0, "Bone Health Champion"],
  ])("%i correct → discovery %i, profile %s", (correct, discovery, profile) => {
    const scores = service.compute(config, correct);
    expect(scores.awareness).toBe(correct);
    expect(scores.discovery).toBe(discovery);
    expect(scores.profile).toBe(profile);
  });

  it("clamps out-of-range counts", () => {
    expect(service.compute(config, 9).awareness).toBe(6);
    expect(service.compute(config, -2).awareness).toBe(0);
  });

  it("rejects unknown strategies", () => {
    expect(() =>
      service.compute({ ...config, strategy: "elo" as never }, 3),
    ).toThrow(/Unknown scoring strategy/);
  });
});
