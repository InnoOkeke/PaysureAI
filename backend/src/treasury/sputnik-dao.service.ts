import { Inject, Injectable } from "@nestjs/common";
import { APP_CONFIG, AppConfig } from "../config/env";

export interface SputnikProposalParams {
  daoContract?: string;
  description: string;
  receiverId: string;
  amountNear: number | string;
  tokenId?: string;
}

@Injectable()
export class SputnikDaoService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  get defaultDaoContract(): string {
    return this.config.SPUTNIK_DAO_CONTRACT;
  }

  buildTransferProposal(params: SputnikProposalParams) {
    const {
      daoContract = this.defaultDaoContract,
      description,
      receiverId,
      amountNear,
      tokenId = "",
    } = params;

    const yoctoMultiplier = BigInt("1000000000000000000000000");
    const amountStr = String(amountNear);
    const parts = amountStr.split(".");
    const whole = BigInt(parts[0] || "0") * yoctoMultiplier;
    let fraction = BigInt(0);
    if (parts[1]) {
      const fractionPadded = parts[1].padEnd(24, "0").slice(0, 24);
      fraction = BigInt(fractionPadded);
    }
    const totalYocto = (whole + fraction).toString();

    const args = {
      proposal: {
        description: `[PaySure AI Treasury Escalation] ${description}`,
        kind: {
          Transfer: {
            token_id: tokenId,
            receiver_id: receiverId,
            amount: totalYocto,
          },
        },
      },
    };

    return {
      contractId: daoContract,
      methodName: "add_proposal",
      args,
      gas: "100000000000000",
      deposit: "100000000000000000000000",
    };
  }
}
