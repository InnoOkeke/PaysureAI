import { Module } from "@nestjs/common";
import { IntentModule } from "../intent/intent.module";
import { AssistantController } from "./assistant.controller";
import { AssistantService } from "./assistant.service";

@Module({
  imports: [IntentModule],
  controllers: [AssistantController],
  providers: [AssistantService],
})
export class AssistantModule {}
