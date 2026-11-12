import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { ContextBuilderService } from "./context-builder.service";
import { IntentController } from "./intent.controller";
import { IntentService } from "./intent.service";

@Module({
  imports: [AiModule],
  controllers: [IntentController],
  providers: [ContextBuilderService, IntentService],
  exports: [IntentService, ContextBuilderService],
})
export class IntentModule {}
