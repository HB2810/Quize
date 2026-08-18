import { randomBytes } from "node:crypto";
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  CreateShareResponse,
  PublicShare,
  ShareCardFormat,
} from "@stavya/contracts";
import { PrismaService } from "../../prisma/prisma.service";
import { CardRendererService } from "./card-renderer.service";
import {
  fillTemplate,
  type ShareConfig,
  type SharePayload,
} from "./share-config.types";
import type { Env } from "../../config/env.schema";
import type { SessionScores } from "../journeys/journey-config.types";

@Injectable()
export class ShareService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly renderer: CardRendererService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private webOrigin(): string {
    return this.config.get("WEB_ORIGIN", { infer: true });
  }

  private apiPublicUrl(): string {
    return this.config.get("API_PUBLIC_URL", { infer: true });
  }

  private cardUrls(publicId: string) {
    const base = `${this.apiPublicUrl()}/api/share/${publicId}/card.png`;
    return {
      square: `${base}?format=square`,
      story: `${base}?format=story`,
      landscape: `${base}?format=landscape`,
    };
  }

  /**
   * Explicit participant share action: snapshot the minimal approved
   * fields under a fresh non-guessable public id. Idempotent per
   * session. Never triggered automatically.
   */
  async createForSession(sessionId: string): Promise<CreateShareResponse> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        journeyVersion: { include: { journey: true } },
        shareResult: true,
      },
    });
    if (!session) {
      throw new NotFoundException({
        code: "SESSION_NOT_FOUND",
        message: "This session does not exist.",
      });
    }
    const scores = session.scores as unknown as SessionScores | null;
    const context = (session.context as { reportUnlocked?: boolean }) ?? {};
    if (session.state !== "COMPLETED" || !scores || !context.reportUnlocked) {
      throw new ConflictException({
        code: "RESULT_NOT_READY",
        message: "Finish the journey to share your result.",
      });
    }
    const shareConfig = session.journeyVersion
      .shareConfig as unknown as ShareConfig | null;
    if (!shareConfig) {
      throw new NotFoundException({
        code: "SHARING_UNAVAILABLE",
        message: "Sharing is not available for this journey.",
      });
    }

    const scoring = session.journeyVersion.scoringConfig as {
      totalQuestions?: number;
    };
    const payload: SharePayload = {
      journeyName: session.journeyVersion.journey.name,
      score: scores.awareness,
      total: scoring.totalQuestions ?? 6,
      profile: scores.profile,
    };

    const existing = session.shareResult;
    const share =
      existing ??
      (await this.prisma.shareResult.create({
        data: {
          publicId: randomBytes(12).toString("base64url"),
          sessionId: session.id,
          journeyVersionId: session.journeyVersionId,
          journeySlug: session.journeyVersion.journey.slug,
          payload: payload as unknown as object,
        },
      }));

    if (!existing) {
      await this.prisma.analyticsEvent
        .create({
          data: {
            sessionId: session.id,
            journeyVersionId: session.journeyVersionId,
            eventType: "share_created",
          },
        })
        .catch(() => undefined);
    }

    const slug = session.journeyVersion.journey.slug;
    const shareUrl = `${this.webOrigin()}/share/${slug}/${share.publicId}`;
    const journeyUrl = `${this.webOrigin()}/j/${slug}`;
    return {
      publicId: share.publicId,
      shareUrl,
      journeyUrl,
      caption: fillTemplate(shareConfig.captionTemplate, {
        score: payload.score,
        total: payload.total,
        journeyName: payload.journeyName,
        url: journeyUrl,
      }),
      cards: this.cardUrls(share.publicId),
    };
  }

  private async loadShare(publicId: string) {
    const share = await this.prisma.shareResult.findUnique({
      where: { publicId },
      include: {
        session: { include: { journeyVersion: { include: { journey: true } } } },
      },
    });
    if (!share || !share.session.journeyVersion.shareConfig) {
      throw new NotFoundException({
        code: "SHARE_NOT_FOUND",
        message: "This shared result is not available.",
      });
    }
    return {
      share,
      config: share.session.journeyVersion
        .shareConfig as unknown as ShareConfig,
      payload: share.payload as unknown as SharePayload,
    };
  }

  /** Public share data — ONLY the approved minimal fields. */
  async getPublicShare(publicId: string): Promise<PublicShare> {
    const { share, config, payload } = await this.loadShare(publicId);
    const journeyUrl = `${this.webOrigin()}/j/${share.journeySlug}`;
    await this.prisma.analyticsEvent
      .create({
        data: {
          journeyVersionId: share.journeyVersionId,
          eventType: "share_viewed",
          properties: { journeySlug: share.journeySlug },
        },
      })
      .catch(() => undefined);
    return {
      journeySlug: share.journeySlug,
      journeyName: payload.journeyName,
      score: payload.score,
      total: payload.total,
      profile: payload.profile,
      tagline: config.card.tagline,
      cta: config.card.cta,
      journeyUrl,
      meta: {
        title: fillTemplate(config.metaTitleTemplate, {
          score: payload.score,
          total: payload.total,
          journeyName: payload.journeyName,
        }),
        description: config.metaDescription,
      },
      cards: this.cardUrls(share.publicId),
    };
  }

  async renderCard(
    publicId: string,
    format: ShareCardFormat,
  ): Promise<Buffer> {
    const { config, payload } = await this.loadShare(publicId);
    const displayUrl = this.webOrigin().replace(/^https?:\/\//, "");
    return this.renderer.render(config, payload, displayUrl, format);
  }
}
