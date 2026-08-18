import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { validateEnv } from "./config/env.schema";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { JourneysModule } from "./modules/journeys/journeys.module";
import { SessionsModule } from "./modules/sessions/sessions.module";
import { ScoringModule } from "./modules/scoring/scoring.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { ParticipantsModule } from "./modules/participants/participants.module";
import { ConsentModule } from "./modules/consent/consent.module";
import { RecognitionModule } from "./modules/recognition/recognition.module";
import { ShareModule } from "./modules/share/share.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AdminModule } from "./modules/admin/admin.module";

/**
 * Modular monolith root. Environment is validated at boot (the app
 * refuses to start on misconfiguration), rate limiting applies
 * globally, and every error leaves through the global filter.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    // Baseline abuse protection: 60 requests/minute per IP. Sensitive
    // endpoints will tighten this with route-level @Throttle overrides.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    HealthModule,
    JourneysModule,
    SessionsModule,
    ScoringModule,
    ReportsModule,
    ParticipantsModule,
    ConsentModule,
    RecognitionModule,
    ShareModule,
    AnalyticsModule,
    AuthModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
