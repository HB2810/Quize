import { Module } from "@nestjs/common";
import { CardRendererService } from "./card-renderer.service";
import { ShareController } from "./share.controller";
import { ShareService } from "./share.service";

/**
 * Sharing engine: explicit share actions → minimal public snapshots,
 * deterministic server-rendered score cards, and safe public share
 * data for the /share pages. Journey-agnostic — each journey brings
 * its own shareConfig template.
 */
@Module({
  controllers: [ShareController],
  providers: [ShareService, CardRendererService],
  exports: [ShareService],
})
export class ShareModule {}
