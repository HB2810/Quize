import { Injectable, NotFoundException } from "@nestjs/common";
import type { PublicJourney } from "@stavya/contracts";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class JourneysService {
  constructor(private readonly prisma: PrismaService) {}

  /** Latest PUBLISHED version of a journey — the only version the public API serves. */
  async getPublishedVersion(slug: string) {
    const version = await this.prisma.journeyVersion.findFirst({
      where: { journey: { slug }, status: "PUBLISHED" },
      orderBy: { versionNumber: "desc" },
      include: { journey: true, languages: true },
    });
    if (!version) {
      throw new NotFoundException({
        code: "JOURNEY_NOT_FOUND",
        message: "This journey is not available.",
      });
    }
    return version;
  }

  async getPublicJourney(slug: string): Promise<PublicJourney> {
    const version = await this.getPublishedVersion(slug);
    return {
      slug: version.journey.slug,
      name: version.journey.name,
      languages: version.languages.map((l: any) => ({
        code: l.code,
        name: l.name,
        isDefault: l.isDefault,
      })),
    };
  }
}
