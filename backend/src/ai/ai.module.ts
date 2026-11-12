import { Global, Module } from "@nestjs/common";
import { AiCacheService } from "./ai-cache.service";
import { AiOrchestrator } from "./ai-orchestrator.service";

@Global()
@Module({
  providers: [AiCacheService, AiOrchestrator],
  exports: [AiCacheService, AiOrchestrator],
})
export class AiModule {}
