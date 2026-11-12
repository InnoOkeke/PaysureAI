import { Module } from "@nestjs/common";
import { PendingActionController } from "./pending-action.controller";
import { PendingActionService } from "./pending-action.service";

@Module({
  controllers: [PendingActionController],
  providers: [PendingActionService],
  exports: [PendingActionService],
})
export class PendingActionModule {}
