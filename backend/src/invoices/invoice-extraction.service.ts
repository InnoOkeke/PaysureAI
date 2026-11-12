import { Injectable, Logger } from "@nestjs/common";
import pdfParse from "pdf-parse";
import { AiOrchestrator } from "../ai/ai-orchestrator.service";
import { buildInvoiceExtractionPrompt } from "../ai/prompts/parse-command.prompt";
import { ExtractedInvoice, ExtractedInvoiceSchema } from "../ai/schemas";

export interface UploadedInvoiceFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Injectable()
export class InvoiceExtractionService {
  private readonly logger = new Logger(InvoiceExtractionService.name);

  constructor(private readonly ai: AiOrchestrator) {}

  get providerName(): string {
    return this.ai.hasProvider && this.ai.providerName !== "none"
      ? this.ai.providerName
      : "PaySure deterministic fallback";
  }

  async extract(file: UploadedInvoiceFile | undefined, rawText?: string): Promise<ExtractedInvoice> {
    const documentText = await this.readDocumentText(file, rawText);

    if (this.ai.hasProvider && documentText.trim().length > 0) {
      try {
        return await this.ai.request<ExtractedInvoice>({
          task: "extract_invoice",
          prompt: buildInvoiceExtractionPrompt(documentText),
          schema: ExtractedInvoiceSchema,
          cacheTTL: 0,
        });
      } catch (error) {
        this.logger.warn(
          `AI invoice extraction failed, using deterministic fallback: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    return this.fallbackExtract(documentText, file);
  }

  private async readDocumentText(
    file: UploadedInvoiceFile | undefined,
    rawText?: string
  ): Promise<string> {
    if (rawText && rawText.trim().length > 0) return rawText;
    if (!file) return "";

    const isPdf =
      file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      try {
        const parsed = await pdfParse(file.buffer);
        return parsed.text ?? "";
      } catch (error) {
        this.logger.warn(
          `PDF parse failed: ${error instanceof Error ? error.message : String(error)}`
        );
        return "";
      }
    }

    return file.buffer.toString("utf-8").slice(0, 12000);
  }

  private fallbackExtract(documentText: string, file?: UploadedInvoiceFile): ExtractedInvoice {
    const labeledAccountMatch = documentText.match(
      /(?:address|account|wallet)[:\s]*([a-z0-9][a-z0-9-_]*\.(?:testnet|near|mainnet))/i
    );
    const nearMatch = documentText.match(/([a-z0-9][a-z0-9-_]{1,62})\.(testnet|near|mainnet)/i);
    const addressMatch = documentText.match(/0x[a-fA-F0-9]{40}/);
    const amountDueMatch = documentText.match(
      /(?:amount\s*due|total(?:\s*due)?|amount)[:\s]*\$?([\d,]+(?:\.\d{1,2})?)\s*(NEAR|USDC|USD|USDT)?/i
    );
    const genericAmountMatch = documentText.match(
      /([\d,]+(?:\.\d{1,2})?)\s*(NEAR|USDC|USD|USDT)\b/i
    );
    const amountMatch = amountDueMatch ?? genericAmountMatch;
    const amountValue = amountMatch
      ? Number(amountMatch[1].replace(/,/g, ""))
      : 75;
    const fromMatch = documentText.match(
      /(?:from|vendor|payee|billed\s*by|issued\s*by)[:\-]\s*([^\n\r]+)/i
    );
    const invoiceMatch = documentText.match(/\bINV[-\s]?([0-9][A-Z0-9-]*)/i);
    const dueDateMatch = documentText.match(/(\d{4}-\d{2}-\d{2})/);
    const suspicious: string[] = [];

    if (/ignore (?:all )?(?:previous|prior) instructions/i.test(documentText)) {
      suspicious.push("Prompt-injection pattern detected and ignored.");
    }
    if (/urgent|account (?:address )?change|new account/i.test(documentText)) {
      suspicious.push("Urgent account-change language detected. Verify the payee independently.");
    }

    const recipientAddress = labeledAccountMatch?.[1] ?? nearMatch?.[0];

    return {
      invoiceNumber: invoiceMatch ? `INV-${invoiceMatch[1]}` : "INV-" + Math.floor(1000 + Math.random() * 9000),
      recipientName:
        fromMatch?.[1]?.trim() ||
        file?.originalname?.replace(/\.[^.]+$/, "") ||
        "Acme Web3 Services",
      recipientAddress: recipientAddress
        ? recipientAddress.toLowerCase()
        : addressMatch
          ? addressMatch[0]
          : "acme-design.testnet",
      amount: amountValue,
      currency: amountMatch?.[2]?.toUpperCase() === "USDC" ? "USDC" : "NEAR",
      dueDate: dueDateMatch?.[1] ?? new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      description: "Software Engineering & Smart Contract Development on NEAR",
      lineItems: [
        {
          description: "Smart Contract Architecture & Security Audit",
          quantity: 1,
          unitPrice: amountValue,
          total: amountValue,
        },
      ],
      confidenceScore: suspicious.length > 0 ? 62 : 82,
      suspiciousFlags: suspicious,
    };
  }
}
