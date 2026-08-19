require("reflect-metadata");
const { NestFactory } = require("@nestjs/core");
const { ExpressAdapter } = require("@nestjs/platform-express");
const express = require("express");
const helmet = require("helmet");

let cachedHandler;

async function bootstrapServerless() {
  // Load compiled NestJS AppModule from dist
  const { AppModule } = require("../dist/app.module");

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
    origin: (origin, callback) => {
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
      callback(null, true);
    },
    methods: ["GET", "POST", "PATCH"],
    credentials: false,
  });

  await app.init();
  return expressInstance;
}

module.exports = async (req, res) => {
  if (!cachedHandler) {
    cachedHandler = await bootstrapServerless();
  }
  return cachedHandler(req, res);
};
