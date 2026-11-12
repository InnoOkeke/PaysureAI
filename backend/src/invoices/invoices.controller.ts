import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { InvoicesService } from "./invoices.service";

const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  recipientName: z.string().min(1),
  recipientAddress: z.string().min(1),
  amount: z.coerce.number().positive(),
  token: z.string().default("NEAR"),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  extractedJson: z.unknown().optional(),
});

@Controller("invoices")
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  async list(@Query("status") status?: string) {
    const invoices = await this.invoices.list(status);
    return { invoices };
  }

  @Post()
  async create(@Body(new ZodValidationPipe(createInvoiceSchema)) body: z.infer<typeof createInvoiceSchema>) {
    const invoice = await this.invoices.create(body);
    return { success: true, invoice };
  }
}
