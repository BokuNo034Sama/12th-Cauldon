import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import type { BackendEnv } from "./config/env.schema";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService<BackendEnv, true>);
  const port = configService.get("PORT", { infer: true });

  app.enableCors({
    origin:
      configService.get("NODE_ENV", { infer: true }) === "production"
        ? false
        : true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(port);
  Logger.log(`12th Cauldron backend listening on ${port}`, "Bootstrap");
}

void bootstrap();
