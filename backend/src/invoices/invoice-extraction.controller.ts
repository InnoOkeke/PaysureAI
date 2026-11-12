import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { InvoiceExtractionService, UploadedInvoiceFile } from "./invoice-extraction.service";

@Controller("ai")
export class InvoiceExtractionController {
  constructor(private readonly extraction: InvoiceExtractionService) {}

  @Post("extract-invoice")
  @UseInterceptors(FileInterceptor("file"))
  async extract(
    @UploadedFile() file: UploadedInvoiceFile | undefined,
    @Body("rawText") rawText?: string
  ) {
    if (!file && !rawText) {
      throw new BadRequestException("No invoice document provided");
    }

    const data = await this.extraction.extract(file, rawText);
    return {
      success: true,
      data: {
        ...data,
        provider: this.extraction.providerName,
      },
    };
  }
}
