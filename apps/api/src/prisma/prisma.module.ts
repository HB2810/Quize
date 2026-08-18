import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/**
 * Global so every domain module injects PrismaService without
 * re-importing. This is the ONLY database access path in the platform;
 * the frontend never touches the database.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
