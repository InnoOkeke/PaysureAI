import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface PrepareActionInput {
  accountId: string;
  payload: Record<string, unknown>;
  quoteSnapshot?: Record<string, unknown>;
  source?: string;
  ttlSeconds?: number;
}

@Injectable()
export class PendingActionService {
  constructor(private readonly prisma: PrismaService) {}

  async prepare(input: PrepareActionInput) {
    const ttlSeconds = input.ttlSeconds ?? 600;
    return this.prisma.pendingAction.create({
      data: {
        accountId: input.accountId,
        kind: "PAYMENT",
        payload: input.payload as Prisma.InputJsonValue,
        quoteSnapshot: input.quoteSnapshot as Prisma.InputJsonValue | undefined,
        status: "QUOTED",
        source: input.source ?? "web",
        expiresAt: new Date(Date.now() + ttlSeconds * 1000),
        idempotencyKey: randomUUID(),
      },
    });
  }

  async get(id: string) {
    const action = await this.prisma.pendingAction.findUnique({ where: { id } });
    if (!action) throw new NotFoundException("Pending action not found");
    return action;
  }

  async confirm(id: string, accountId: string) {
    const action = await this.prisma.pendingAction.findFirst({ where: { id, accountId } });
    if (!action) throw new NotFoundException("Pending action not found");

    if (action.status !== "QUOTED") {
      throw new BadRequestException("This payment approval was already used");
    }

    if (action.expiresAt.getTime() <= Date.now()) {
      await this.prisma.pendingAction.updateMany({
        where: { id, accountId, status: "QUOTED" },
        data: { status: "EXPIRED" },
      });
      throw new BadRequestException("This payment quote has expired");
    }

    const claimed = await this.prisma.pendingAction.updateMany({
      where: { id, accountId, status: "QUOTED", expiresAt: { gt: new Date() } },
      data: { status: "CONFIRMED", confirmedAt: new Date() },
    });

    if (claimed.count !== 1) {
      throw new BadRequestException("This payment approval was already used or expired");
    }

    return this.get(id);
  }

  async cancel(id: string, accountId: string) {
    const result = await this.prisma.pendingAction.updateMany({
      where: { id, accountId, status: { in: ["QUOTED", "CONFIRMED"] } },
      data: { status: "CANCELLED" },
    });

    if (result.count !== 1) {
      throw new BadRequestException("Pending action could not be cancelled");
    }

    return this.get(id);
  }

  async markExecuted(id: string, accountId: string, txHash: string) {
    const result = await this.prisma.pendingAction.updateMany({
      where: { id, accountId, status: "CONFIRMED" },
      data: { status: "EXECUTED", executedAt: new Date(), executionTxHash: txHash },
    });

    if (result.count !== 1) {
      throw new BadRequestException("Pending action must be confirmed before execution");
    }

    return this.get(id);
  }
}
