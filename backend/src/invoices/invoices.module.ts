import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { InvoiceExtractionController } from "./invoice-extraction.controller";
import { InvoiceExtractionService } from "./invoice-extraction.service";
import { InvoicesController } from "./invoices.controller";
import { InvoicesService } from "./invoices.service";

@Module({
  imports: [AiModule],
  controllers: [InvoicesController, InvoiceExtractionController],
  providers: [InvoicesService, InvoiceExtractionService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
