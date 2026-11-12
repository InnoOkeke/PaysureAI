import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { PrismaModule } from "./prisma/prisma.module";
import { NearModule } from "./near/near.module";
import { TreasuryModule } from "./treasury/treasury.module";
import { RecipientsModule } from "./recipients/recipients.module";
import { AiModule } from "./ai/ai.module";
import { IntentModule } from "./intent/intent.module";
import { InvoicesModule } from "./invoices/invoices.module";
import { PaymentsModule } from "./payments/payments.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { AssistantModule } from "./assistant/assistant.module";
import { AgentModule } from "./agent/agent.module";
import { SeedModule } from "./seed/seed.module";
import { PendingActionModule } from "./pending/pending-action.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    NearModule,
    TreasuryModule,
    RecipientsModule,
    AiModule,
    IntentModule,
    InvoicesModule,
    PaymentsModule,
    DashboardModule,
    AssistantModule,
    AgentModule,
    SeedModule,
    PendingActionModule,
    HealthModule,
  ],
})
export class AppModule {}
