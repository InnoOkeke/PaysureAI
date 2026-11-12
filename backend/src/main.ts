import "reflect-metadata";
import * as dotenv from "dotenv";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { loadConfig } from "./config/env";
import { AllExceptionsFilter } from "./common/http-exception.filter";

dotenv.config();

async function bootstrap() {
  const config = loadConfig();
  const app = await NestFactory.create(AppModule, { cors: false });

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: config.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  await app.listen(config.PORT, "0.0.0.0");
  console.log(`PaySure AI backend listening on http://localhost:${config.PORT}/api`);
}

bootstrap().catch((error) => {
  console.error("Failed to boot PaySure AI backend", error);
  process.exit(1);
});
