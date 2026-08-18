import { Module } from "@nestjs/common";

/**
 * Analytics domain: privacy-safe journey events (started, answered,
 * completed, abandoned, report unlocked...). Events never contain PII.
 * Built out in Foundation 14.
 */
@Module({})
export class AnalyticsModule {}
