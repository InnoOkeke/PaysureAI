import { Global, Module } from "@nestjs/common";
import { RecipientsController } from "./recipients.controller";
import { RecipientsService } from "./recipients.service";

@Global()
@Module({
  controllers: [RecipientsController],
  providers: [RecipientsService],
  exports: [RecipientsService],
})
export class RecipientsModule {}
