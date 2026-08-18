import { Module } from "@nestjs/common";
import { ReportsService } from "./reports.service";

/**
 * Report domain: assembles personalized snapshots from the journey
 * version's reportTemplate + session data (standard copy variations +
 * answer-derived Awareness Map).
 */
@Module({
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
