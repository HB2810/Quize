import { Injectable } from "@nestjs/common";
import type {
  ScoringConfig,
  SessionScores,
} from "../journeys/journey-config.types";

/**
 * Pluggable scoring strategies. Healthy Bones uses "correct-count":
 * Awareness = correct answers / total, Discovery = incorrect count.
 * Educational awareness measures only — never clinical scores.
 */
@Injectable()
export class ScoringService {
  compute(config: ScoringConfig, correctCount: number): SessionScores {
    if (config.strategy !== "correct-count") {
      throw new Error(`Unknown scoring strategy: ${String(config.strategy)}`);
    }
    const awareness = Math.max(
      0,
      Math.min(correctCount, config.totalQuestions),
    );
    const discovery = config.totalQuestions - awareness;
    const band = config.profiles.find(
      (p) => awareness >= p.min && awareness <= p.max,
    );
    return {
      awareness,
      discovery,
      profile: band?.profile ?? "",
    };
  }
}
