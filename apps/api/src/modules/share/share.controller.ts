import { Controller, Get, Header, Param, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import {
  ShareCardFormatSchema,
  type PublicShare,
  type ShareCardFormat,
} from "@stavya/contracts";
import { ShareService } from "./share.service";

@Controller("share")
export class ShareController {
  constructor(private readonly share: ShareService) {}

  @Get(":publicId")
  getShare(@Param("publicId") publicId: string): Promise<PublicShare> {
    return this.share.getPublicShare(publicId);
  }

  @Get(":publicId/card.png")
  @Header("Content-Type", "image/png")
  // Deterministic from result data → safely cacheable.
  @Header("Cache-Control", "public, max-age=86400, immutable")
  async getCard(
    @Param("publicId") publicId: string,
    @Query("format") format: string | undefined,
    @Res() res: Response,
  ) {
    const parsed = ShareCardFormatSchema.safeParse(format ?? "square");
    const cardFormat: ShareCardFormat = parsed.success
      ? parsed.data
      : "square";
    const png = await this.share.renderCard(publicId, cardFormat);
    res.send(png);
  }
}
