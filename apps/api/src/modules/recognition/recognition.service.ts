import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import sharp from "sharp";
import type {
  DisplayFeed,
  DisplayNameChoiceValue,
  RecognitionState,
} from "@stavya/contracts";
import type { Prisma } from "@prisma/client";

type DisplayNameChoice = "FIRST_NAME" | "INITIAL" | "ANONYMOUS";
type Recognition = Prisma.RecognitionGetPayload<{}>;
import { PrismaService } from "../../prisma/prisma.service";
import type { Env } from "../../config/env.schema";
import type { SessionScores } from "../journeys/journey-config.types";

const CONSENT_WORDING_VERSION = "healthy-bones-recognition-v1";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const CHOICE_MAP: Record<DisplayNameChoiceValue, DisplayNameChoice> = {
  "first-name": "FIRST_NAME",
  initial: "INITIAL",
  anonymous: "ANONYMOUS",
};

/**
 * 6/6 recognition (approved doc §13–14): appears ONLY at a perfect
 * score, after report unlock. Recognition consent is separate from
 * communication consent; selfie capture only after explicit consent;
 * the OPD display shows ONLY selfie + chosen display name +
 * achievement — never contact details, age, gender, or answers.
 */
@Injectable()
export class RecognitionService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private mediaDir(): string {
    return join(this.config.get("MEDIA_DIR", { infer: true }), "recognition");
  }

  async onModuleInit() {
    await mkdir(this.mediaDir(), { recursive: true });
  }

  // ---------- Participant flow ----------

  private async loadEligibleSession(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        participant: true,
        recognition: true,
        journeyVersion: { include: { journey: true } },
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
    const scoring = session.journeyVersion.scoringConfig as {
      totalQuestions?: number;
    };
    const total = scoring.totalQuestions ?? 6;
    if (
      session.state !== "COMPLETED" ||
      !context.reportUnlocked ||
      !scores ||
      scores.awareness !== total
    ) {
      throw new ForbiddenException({
        code: "NOT_ELIGIBLE",
        message: "Recognition is available only for a perfect score.",
      });
    }
    return session;
  }

  toState(recognition: Recognition | null): RecognitionState {
    if (!recognition) return { status: "PENDING", hasSelfie: false };
    return {
      status: recognition.status,
      hasSelfie: Boolean(recognition.selfiePath),
      ...(recognition.displayName
        ? { displayName: recognition.displayName }
        : {}),
    };
  }

  private deriveDisplayName(
    fullName: string,
    choice: DisplayNameChoiceValue,
  ): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    switch (choice) {
      case "first-name":
        return parts[0] ?? "Stavya Champion";
      case "initial":
        return parts.map((p) => `${p[0]?.toUpperCase() ?? ""}.`).join(" ");
      case "anonymous":
        return "A Stavya Champion";
    }
  }

  async consent(
    sessionId: string,
    granted: boolean,
    displayNameChoice?: DisplayNameChoiceValue,
  ): Promise<RecognitionState> {
    const session = await this.loadEligibleSession(sessionId);
    if (
      session.recognition &&
      session.recognition.status === "COMPLETED"
    ) {
      throw new ConflictException({
        code: "ALREADY_PUBLISHED",
        message: "Your recognition is already on the display.",
      });
    }
    const participantName = session.participant?.name ?? "";
    const displayName =
      granted && displayNameChoice
        ? this.deriveDisplayName(participantName, displayNameChoice)
        : null;

    const recognition = await this.prisma.recognition.upsert({
      where: { sessionId },
      create: {
        sessionId,
        eligible: true,
        status: granted ? "ELIGIBLE" : "DECLINED",
        displayChoice:
          granted && displayNameChoice ? CHOICE_MAP[displayNameChoice] : null,
        displayName,
      },
      update: {
        status: granted ? "ELIGIBLE" : "DECLINED",
        displayChoice:
          granted && displayNameChoice ? CHOICE_MAP[displayNameChoice] : null,
        displayName,
      },
    });

    if (session.participant) {
      await this.prisma.consent.create({
        data: {
          participantId: session.participant.id,
          sessionId,
          type: "PUBLIC_RECOGNITION",
          granted,
          wordingVersion: CONSENT_WORDING_VERSION,
        },
      });
    }
    await this.track(
      session.id,
      session.journeyVersionId,
      granted ? "recognition_consented" : "recognition_declined",
    );
    return this.toState(recognition);
  }

  async uploadSelfie(
    sessionId: string,
    file: { buffer: Buffer; mimetype: string; size: number } | undefined,
  ): Promise<RecognitionState> {
    const session = await this.loadEligibleSession(sessionId);
    const recognition = session.recognition;
    if (!recognition || recognition.status !== "ELIGIBLE") {
      throw new ConflictException({
        code: "CONSENT_REQUIRED",
        message: "Selfie capture needs your recognition consent first.",
      });
    }
    if (!file || file.size === 0) {
      throw new BadRequestException({
        code: "NO_FILE",
        message: "No photo received.",
      });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new BadRequestException({
        code: "FILE_TOO_LARGE",
        message: "Photo is too large (max 8 MB).",
      });
    }
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.mimetype)) {
      throw new BadRequestException({
        code: "UNSUPPORTED_TYPE",
        message: "Please upload a photo (JPEG, PNG or WebP).",
      });
    }

    // Re-encode: EXIF-orientation applied, ALL metadata stripped
    // (GPS etc.), bounded dimensions. Never store the original bytes.
    let processed: Buffer;
    try {
      processed = await sharp(file.buffer)
        .rotate()
        .resize(1080, 1080, { fit: "cover", position: "attention" })
        .jpeg({ quality: 84 })
        .toBuffer();
    } catch {
      throw new BadRequestException({
        code: "INVALID_IMAGE",
        message: "That file doesn't look like a photo. Please try again.",
      });
    }

    const filename = `${recognition.id}-${randomBytes(6).toString("hex")}.jpg`;
    await writeFile(join(this.mediaDir(), filename), processed);

    // Replace any previous selfie (retake) — never keep orphans.
    if (recognition.selfiePath) {
      await unlink(join(this.mediaDir(), recognition.selfiePath)).catch(
        () => undefined,
      );
    }
    const updated = await this.prisma.recognition.update({
      where: { id: recognition.id },
      data: { selfiePath: filename },
    });
    await this.track(session.id, session.journeyVersionId, "selfie_uploaded");
    return this.toState(updated);
  }

  /** Participant's own selfie for the preview screens (session-scoped). */
  async getOwnSelfie(sessionId: string): Promise<Buffer> {
    const recognition = await this.prisma.recognition.findUnique({
      where: { sessionId },
    });
    if (!recognition?.selfiePath) {
      throw new NotFoundException({
        code: "NO_SELFIE",
        message: "No photo yet.",
      });
    }
    return readFile(join(this.mediaDir(), recognition.selfiePath));
  }

  async publish(sessionId: string): Promise<RecognitionState> {
    const session = await this.loadEligibleSession(sessionId);
    const recognition = session.recognition;
    if (!recognition || recognition.status !== "ELIGIBLE") {
      throw new ConflictException({
        code: "CONSENT_REQUIRED",
        message: "Recognition consent is needed before publishing.",
      });
    }
    if (!recognition.selfiePath) {
      throw new ConflictException({
        code: "SELFIE_REQUIRED",
        message: "Take your selfie before publishing.",
      });
    }
    const updated = await this.prisma.recognition.update({
      where: { id: recognition.id },
      data: { status: "COMPLETED", publishedAt: new Date() },
    });
    await this.track(
      session.id,
      session.journeyVersionId,
      "recognition_published",
    );
    return this.toState(updated);
  }

  // ---------- OPD display (public within the hospital) ----------

  async displayFeed(apiPublicUrl: string): Promise<DisplayFeed> {
    const rows = await this.prisma.recognition.findMany({
      where: { status: "COMPLETED", selfiePath: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 12,
      include: {
        session: {
          include: { journeyVersion: { include: { journey: true } } },
        },
      },
    });
    return {
      entries: rows.map((row: any) => ({
        id: row.id,
        displayName: row.displayName ?? "A Stavya Champion",
        journeyName: row.session.journeyVersion.journey.name,
        achievement: "6/6",
        imageUrl: `${apiPublicUrl}/api/recognition/display/${row.id}/photo`,
        publishedAt: (row.publishedAt ?? row.updatedAt).toISOString(),
      })),
    };
  }

  /** Published selfies only — unpublished media is never reachable. */
  async getPublishedPhoto(recognitionId: string): Promise<Buffer> {
    const recognition = await this.prisma.recognition.findUnique({
      where: { id: recognitionId },
    });
    if (
      !recognition ||
      recognition.status !== "COMPLETED" ||
      !recognition.selfiePath
    ) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "Not available.",
      });
    }
    return readFile(join(this.mediaDir(), recognition.selfiePath));
  }

  private async track(
    sessionId: string,
    journeyVersionId: string,
    eventType: string,
  ) {
    await this.prisma.analyticsEvent
      .create({ data: { sessionId, journeyVersionId, eventType } })
      .catch(() => undefined);
  }
}
