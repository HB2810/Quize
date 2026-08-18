import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  AnswerEvaluation,
  ContactRequest,
  SessionResponse,
  StepPayload,
  SubmitStepRequest,
  SubmitStepResponse,
} from "@stavya/contracts";
import type { Prisma, Session } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { JourneysService } from "../journeys/journeys.service";
import { ScoringService } from "../scoring/scoring.service";
import { ReportsService } from "../reports/reports.service";
import { RecognitionService } from "../recognition/recognition.service";
import type { Env } from "../../config/env.schema";
import {
  questionVariantSuffix,
  type FlowConfig,
  type FlowStepConfig,
  type ReportTemplate,
  type ScoringConfig,
  type SessionContext,
  type SessionScores,
} from "../journeys/journey-config.types";

const SESSION_TTL_HOURS = 24;
const CONSENT_WORDING_VERSION = "healthy-bones-v1";

type SessionWithVersion = Prisma.SessionGetPayload<{
  include: {
    journeyVersion: { include: { journey: true; languages: true } };
  };
}>;

/**
 * Server-authoritative session engine. The client never asserts
 * position or correctness — it asks for the current step, submits what
 * the participant did, and renders whatever comes back. Refresh/back
 * recovery is therefore free: GET the current step and resume.
 */
@Injectable()
export class SessionsService {
  private readonly isTestMode: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly journeys: JourneysService,
    private readonly scoring: ScoringService,
    private readonly reports: ReportsService,
    private readonly recognitionService: RecognitionService,
    private readonly config: ConfigService<Env, true>,
  ) {
    this.isTestMode = this.config.get("TEST_MODE", { infer: true }) ?? false;
  }

  // ---------- Public API ----------

  async create(journeySlug: string): Promise<SessionResponse> {
    const version = await this.journeys.getPublishedVersion(journeySlug);
    const session = await this.prisma.session.create({
      data: {
        journeyVersionId: version.id,
        expiresAt: new Date(Date.now() + SESSION_TTL_HOURS * 3600_000),
      },
      include: {
        journeyVersion: { include: { journey: true, languages: true } },
      },
    });
    await this.track(session.id, version.id, "journey_started");
    return {
      sessionId: session.id,
      journeySlug,
      state: session.state,
      step: await this.buildStep(session),
    };
  }

  async getStep(sessionId: string): Promise<SessionResponse> {
    const session = await this.loadSession(sessionId);
    return {
      sessionId: session.id,
      journeySlug: session.journeyVersion.journey.slug,
      state: session.state,
      step: await this.buildStep(session),
    };
  }

  async submitStep(
    sessionId: string,
    body: SubmitStepRequest,
  ): Promise<SubmitStepResponse> {
    const session = await this.loadSession(sessionId);
    const stepConfig = this.currentStepConfig(session);

    if (stepConfig.type !== body.type) {
      // Stale client (double-tap, refresh race): report where the
      // session actually is instead of failing the journey.
      throw new ConflictException({
        code: "STEP_MISMATCH",
        message: "The session has moved on. Refresh to continue.",
      });
    }

    switch (body.type) {
      case "LANGUAGE_SELECT": {
        const known = session.journeyVersion.languages.some(
          (l) => l.code === body.language,
        );
        if (!known) {
          throw new BadRequestException({
            code: "UNSUPPORTED_LANGUAGE",
            message: "That language is not available for this journey.",
          });
        }
        await this.advance(session, { language: body.language });
        await this.track(session.id, session.journeyVersionId, "language_selected", {
          language: body.language,
        });
        break;
      }
      case "DEMOGRAPHIC": {
        if (stepConfig.key !== body.key) {
          throw new ConflictException({
            code: "STEP_MISMATCH",
            message: "The session has moved on. Refresh to continue.",
          });
        }
        const valid = (stepConfig.options ?? []).some(
          (o) => o.value === body.value,
        );
        if (!valid) {
          throw new BadRequestException({
            code: "INVALID_OPTION",
            message: "That option is not available.",
          });
        }
        const context = this.contextOf(session);
        context[body.key] = body.value;
        const data: Prisma.SessionUpdateInput = { context: context as object };
        if (body.key === "ageRange") {
          const pathway = await this.prisma.pathway.findUnique({
            where: {
              journeyVersionId_key: {
                journeyVersionId: session.journeyVersionId,
                key: body.value,
              },
            },
          });
          if (!pathway) {
            throw new BadRequestException({
              code: "INVALID_OPTION",
              message: "That option is not available.",
            });
          }
          data.pathway = { connect: { id: pathway.id } };
        }
        await this.advance(session, data);
        await this.track(
          session.id,
          session.journeyVersionId,
          `${body.key === "ageRange" ? "age_range" : "gender"}_selected`,
          { value: body.value },
        );
        break;
      }
      case "INTRO":
      case "REPORT_TEASER": {
        await this.advance(session, {});
        break;
      }
      case "QUESTION": {
        return this.submitAnswer(session, stepConfig, body);
      }
    }

    const fresh = await this.loadSession(sessionId);
    return { step: await this.buildStep(fresh) };
  }

  async submitContact(
    sessionId: string,
    body: ContactRequest,
  ): Promise<SubmitStepResponse> {
    const session = await this.loadSession(sessionId);
    const stepConfig = this.currentStepConfig(session);
    if (stepConfig.type !== "CONTACT") {
      throw new ConflictException({
        code: "STEP_MISMATCH",
        message: "The session has moved on. Refresh to continue.",
      });
    }

    let participantId: string | undefined;

    if (!this.isTestMode) {
      const participant = await this.prisma.participant.create({
        data: {
          name: body.name,
          mobile: body.mobile,
          email: body.email ?? null,
          consents: {
            create: {
              sessionId: session.id,
              type: "COMMUNICATION",
              granted: true,
              wordingVersion: CONSENT_WORDING_VERSION,
            },
          },
        },
      });
      participantId = participant.id;
    }

    const context = this.contextOf(session);
    context.reportUnlocked = true;
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        ...(participantId ? { participant: { connect: { id: participantId } } } : {}),
        context: context as object,
        currentStepIndex: session.currentStepIndex + 1,
        state: "COMPLETED",
        completedAt: new Date(),
      },
    });
    await this.track(session.id, session.journeyVersionId, "report_unlocked");

    const fresh = await this.loadSession(sessionId);
    return { step: await this.buildStep(fresh) };
  }

  // ---------- Internals ----------

  private async loadSession(sessionId: string): Promise<SessionWithVersion> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        journeyVersion: { include: { journey: true, languages: true } },
      },
    });
    if (!session) {
      throw new NotFoundException({
        code: "SESSION_NOT_FOUND",
        message: "This session does not exist.",
      });
    }
    if (
      session.state === "IN_PROGRESS" &&
      session.expiresAt &&
      session.expiresAt.getTime() < Date.now()
    ) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { state: "EXPIRED" },
      });
      throw new GoneException({
        code: "SESSION_EXPIRED",
        message: "This session has expired. Please start again.",
      });
    }
    if (session.state === "EXPIRED") {
      throw new GoneException({
        code: "SESSION_EXPIRED",
        message: "This session has expired. Please start again.",
      });
    }
    return session;
  }

  private flowOf(session: SessionWithVersion): FlowConfig {
    return session.journeyVersion.flowConfig as unknown as FlowConfig;
  }

  private contextOf(session: Session): SessionContext {
    return { ...((session.context as SessionContext | null) ?? {}) };
  }

  private currentStepConfig(session: SessionWithVersion): FlowStepConfig {
    const steps = this.flowOf(session).steps;
    const config = steps[session.currentStepIndex];
    if (!config) {
      // Past the end — the terminal step is the report.
      return steps[steps.length - 1]!;
    }
    return config;
  }

  private async advance(
    session: SessionWithVersion,
    data: Prisma.SessionUpdateInput,
  ) {
    await this.prisma.session.update({
      where: { id: session.id },
      data: { ...data, currentStepIndex: session.currentStepIndex + 1 },
    });
  }

  /** The exact question this session must see at a given slot. */
  private async expectedQuestion(session: SessionWithVersion, slot: number) {
    if (!session.pathwayId) {
      throw new ConflictException({
        code: "STEP_MISMATCH",
        message: "The session has moved on. Refresh to continue.",
      });
    }
    const context = this.contextOf(session);
    const candidates = await this.prisma.question.findMany({
      where: { pathwayId: session.pathwayId, sequence: slot, isActive: true },
      include: {
        translations: { where: { language: "en" } },
        options: {
          orderBy: { sequence: "asc" },
          include: { translations: { where: { language: "en" } } },
        },
      },
    });
    const question =
      candidates.length === 1
        ? candidates[0]
        : candidates.find((q) =>
            q.questionKey.endsWith(questionVariantSuffix(context.gender)),
          );
    if (!question) {
      throw new NotFoundException({
        code: "QUESTION_NOT_FOUND",
        message: "This journey's content is unavailable.",
      });
    }
    return question;
  }

  private async submitAnswer(
    session: SessionWithVersion,
    stepConfig: FlowStepConfig,
    body: Extract<SubmitStepRequest, { type: "QUESTION" }>,
  ): Promise<SubmitStepResponse> {
    const slot = stepConfig.slot ?? 0;
    const question = await this.expectedQuestion(session, slot);
    if (question.questionKey !== body.questionKey) {
      throw new ConflictException({
        code: "STEP_MISMATCH",
        message: "The session has moved on. Refresh to continue.",
      });
    }
    const option = question.options.find((o) => o.optionKey === body.optionKey);
    if (!option) {
      throw new BadRequestException({
        code: "INVALID_OPTION",
        message: "That option is not available.",
      });
    }

    const translation = question.translations[0];
    const correctOption = question.options.find((o) => o.isCorrect);
    const evaluation: AnswerEvaluation = {
      wasCorrect: option.isCorrect,
      correctOptionKey: correctOption?.optionKey ?? "",
      ahaMoment: translation?.ahaMoment ?? "",
      takeaway: translation?.takeaway ?? "",
    };

    try {
      await this.prisma.response.create({
        data: {
          sessionId: session.id,
          questionId: question.id,
          optionId: option.id,
          wasCorrect: option.isCorrect,
        },
      });
    } catch (error) {
      // Duplicate submission (double-tap/refresh): idempotent replay of
      // the recorded evaluation; never a second Response row.
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code === "P2002"
      ) {
        const existing = await this.prisma.response.findUnique({
          where: {
            sessionId_questionId: {
              sessionId: session.id,
              questionId: question.id,
            },
          },
        });
        const fresh = await this.loadSession(session.id);
        return {
          evaluation: { ...evaluation, wasCorrect: existing?.wasCorrect ?? false },
          step: await this.buildStep(fresh),
        };
      }
      throw error;
    }

    await this.track(session.id, session.journeyVersionId, "question_answered", {
      questionKey: question.questionKey,
      slot,
      wasCorrect: option.isCorrect,
    });

    const totalSlots = (this.flowOf(session).steps ?? []).filter(
      (s) => s.type === "QUESTION",
    ).length;
    const update: Prisma.SessionUpdateInput = {};
    if (slot >= totalSlots) {
      const correctCount = await this.prisma.response.count({
        where: { sessionId: session.id, wasCorrect: true },
      });
      const scoring = session.journeyVersion
        .scoringConfig as unknown as ScoringConfig;
      const scores = this.scoring.compute(scoring, correctCount);
      update.scores = scores as unknown as object;
      await this.track(session.id, session.journeyVersionId, "journey_completed", {
        awareness: scores.awareness,
        discovery: scores.discovery,
      });
    }

    await this.advance(session, update);
    const fresh = await this.loadSession(session.id);
    return { evaluation, step: await this.buildStep(fresh) };
  }

  private async buildStep(session: SessionWithVersion): Promise<StepPayload> {
    const config = this.currentStepConfig(session);
    const copy = config.copy;

    switch (config.type) {
      case "LANGUAGE_SELECT":
        return {
          type: "LANGUAGE_SELECT",
          title: String(copy?.title ?? ""),
          body: String(copy?.body ?? ""),
          prompt: String(copy?.prompt ?? ""),
          cta: String(copy?.cta ?? "Continue"),
          options: session.journeyVersion.languages.map((l) => ({
            value: l.code,
            label: l.name,
          })),
        };
      case "DEMOGRAPHIC":
        return {
          type: "DEMOGRAPHIC",
          key: config.key ?? "ageRange",
          title: String(copy?.title ?? ""),
          body: String(copy?.body ?? ""),
          prompt: String(copy?.prompt ?? ""),
          cta: String(copy?.cta ?? "Continue"),
          options: config.options ?? [],
        };
      case "INTRO":
        return {
          type: "INTRO",
          title: String(copy?.title ?? ""),
          body: Array.isArray(copy?.body) ? copy.body : [String(copy?.body ?? "")],
          cta: String(copy?.cta ?? "Continue"),
        };
      case "QUESTION": {
        const question = await this.expectedQuestion(session, config.slot ?? 0);
        const translation = question.translations[0];
        return {
          type: "QUESTION",
          progress: {
            current: config.slot ?? 0,
            total: this.flowOf(session).steps.filter(
              (s) => s.type === "QUESTION",
            ).length,
          },
          questionKey: question.questionKey,
          topic: question.topic,
          text: translation?.questionText ?? "",
          // Options WITHOUT correctness — never sent pre-submission.
          options: question.options.map((o) => ({
            key: o.optionKey,
            label: o.translations[0]?.text ?? "",
          })),
        };
      }
      case "REPORT_TEASER": {
        const scores = session.scores as unknown as SessionScores | null;
        const template = session.journeyVersion
          .reportTemplate as unknown as ReportTemplate;
        return {
          type: "REPORT_TEASER",
          title: String(copy?.title ?? ""),
          body: String(copy?.body ?? ""),
          teaser: template.teasers[String(scores?.awareness ?? 0)] ?? "",
          bullets: copy?.bullets ?? [],
          cta: String(copy?.cta ?? "Continue"),
        };
      }
      case "CONTACT":
        return {
          type: "CONTACT",
          title: String(copy?.title ?? ""),
          body: String(copy?.body ?? ""),
          consentText: String(copy?.consentText ?? ""),
          cta: String(copy?.cta ?? "Continue"),
        };
      case "REPORT": {
        const context = this.contextOf(session);
        if (!context.reportUnlocked) {
          throw new ForbiddenException({
            code: "REPORT_LOCKED",
            message: "The report unlocks after contact details are submitted.",
          });
        }
        const scores = session.scores as unknown as SessionScores;
        const template = session.journeyVersion
          .reportTemplate as unknown as ReportTemplate;
        const report = await this.reports.buildReport(
          session.id,
          template,
          context,
          scores,
        );
        const recognitionEligible =
          scores.awareness === report.awareness.total;
        let recognitionState;
        if (recognitionEligible) {
          const row = await this.prisma.recognition.findUnique({
            where: { sessionId: session.id },
          });
          recognitionState = this.recognitionService.toState(row);
        }
        return {
          type: "REPORT",
          report,
          recognitionEligible,
          ...(recognitionState ? { recognition: recognitionState } : {}),
        };
      }
    }
  }

  /** Privacy-safe analytics: session ids and journey facts only, never PII. */
  private async track(
    sessionId: string,
    journeyVersionId: string,
    eventType: string,
    properties?: Record<string, unknown>,
  ) {
    try {
      await this.prisma.analyticsEvent.create({
        data: {
          sessionId,
          journeyVersionId,
          eventType,
          properties: (properties ?? undefined) as object | undefined,
        },
      });
    } catch {
      // Analytics must never break the journey.
    }
  }
}
