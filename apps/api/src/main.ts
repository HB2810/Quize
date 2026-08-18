import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";
import type { Env } from "./config/env.schema";

async function bootstrap() {
  // Env validation runs inside ConfigModule during create(); a bad
  // environment throws here and the process exits non-zero.
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService<Env, true>);
  const port = config.get("API_PORT", { infer: true });
  const webOrigin = config.get("WEB_ORIGIN", { infer: true });

  app.setGlobalPrefix("api");
  app.use(
    helmet({
      // Share cards and published display photos are meant to be
      // embedded cross-origin (web app, OG scrapers, OPD screens).
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (such as mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (origin === webOrigin) return callback(null, true);

      // Allow any local network origin (localhost, 127.0.0.1, 192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      const isLocalNetwork =
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(
          origin,
        );
      if (isLocalNetwork) {
        return callback(null, true);
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    methods: ["GET", "POST", "PATCH"],
    credentials: false,
  });
  app.enableShutdownHooks();

  await app.listen(port, "0.0.0.0");
  new Logger("Bootstrap").log(
    `Stavya API listening on http://0.0.0.0:${port}/api (CORS allowed for local network & ${webOrigin})`,
  );
}

void bootstrap();
