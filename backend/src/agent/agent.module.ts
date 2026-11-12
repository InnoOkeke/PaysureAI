import { Module } from "@nestjs/common";
import { IntentModule } from "../intent/intent.module";
import { AgentController } from "./agent.controller";
import { AgentService } from "./agent.service";

@Module({
  imports: [IntentModule],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}
