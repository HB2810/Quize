import { Injectable } from "@nestjs/common";
import type { ReportPayload } from "@stavya/contracts";
import {
  genderRouteOf,
  TOPIC_ORDER,
  type ReportTemplate,
  type SessionContext,
  type SessionScores,
} from "../journeys/journey-config.types";
import { PrismaService } from "../../prisma/prisma.service";

const AGE_LABELS: Record<string, string> = {
  "18-25": "18–25",
  "26-35": "26–35",
  "36-45": "36–45",
  "46-55": "46–55",
  "56-65": "56–65",
  "66+": "66+",
};

/**
 * Assembles the personalized Snapshot: standard report copy (21
 * variations = 7 scores × 3 gender routes, per the approved
 * spreadsheet) + the Awareness Map computed from actual answers.
 * Phase 2 rule: report COPY never varies by individual questions.
 */
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async buildReport(
    sessionId: string,
    template: ReportTemplate,
    context: SessionContext,
    scores: SessionScores,
  ): Promise<ReportPayload> {
    const route = genderRouteOf(context.gender);
    const genderCopy = template.genderCopy[route];
    const scoreCopy = template.scoreCopy[String(scores.awareness)];
    if (!scoreCopy) {
      throw new Error(`No report copy for score ${scores.awareness}`);
    }

    // Awareness Map from actual answers: a topic is "strong" when every
    // question in it was answered correctly, otherwise "explore".
    const responses = await this.prisma.response.findMany({
      where: { sessionId },
      include: { question: { select: { topic: true } } },
    });
    const byTopic = new Map<string, boolean>();
    for (const response of responses) {
      const topic = response.question.topic;
      byTopic.set(topic, (byTopic.get(topic) ?? true) && response.wasCorrect);
    }
    const awarenessMap = TOPIC_ORDER.filter((topic: string) => byTopic.has(topic)).map(
      (topic: string) => ({
        topic,
        status: byTopic.get(topic) ? ("strong" as const) : ("explore" as const),
      }),
    );

    const isBonus = scores.discovery === 0;

    return {
      title: template.title,
      headline: scoreCopy.headline,
      opening: scoreCopy.opening,
      lifeStage: AGE_LABELS[context.ageRange ?? ""] ?? (context.ageRange ?? ""),
      profile: scores.profile,
      awareness: { score: scores.awareness, total: responses.length || 6 },
      discovery: {
        count: scores.discovery,
        isBonus,
        statement: scoreCopy.discoveryStatement,
        // 6/6: the gender-route insight serves as the Bonus Discovery
        // (documented content decision — no separate bonus copy exists).
        ...(isBonus ? { bonus: genderCopy.insight } : {}),
      },
      awarenessMap,
      genderInsight: genderCopy.insight,
      whatThisMeans: scoreCopy.whatThisMeans,
      worthKnowing: genderCopy.worthKnowing,
      doctorQuote: genderCopy.doctorQuote,
      cta: template.cta,
      footer: template.footer,
    };
  }
}
