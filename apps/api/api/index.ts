import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import express, { Request, Response } from "express";
import helmet from "helmet";
import { AppModule } from "../src/app.module";

let cachedHandler: (req: Request, res: Response) => void;

async function bootstrapServerless() {
  const expressInstance = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.setGlobalPrefix("api");
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || origin === webOrigin || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      const isLocalNetwork =
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(
          origin,
        );
      if (isLocalNetwork) {
        return callback(null, true);
      }
      callback(null, true); // Allow on Vercel serverless
    },
    methods: ["GET", "POST", "PATCH"],
    credentials: false,
  });

  await app.init();
  return expressInstance;
}

export default async function handler(req: Request, res: Response) {
  if (!cachedHandler) {
    cachedHandler = await bootstrapServerless();
  }
  return cachedHandler(req, res);
}
