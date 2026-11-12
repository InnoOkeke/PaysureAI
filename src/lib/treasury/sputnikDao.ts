/**
 * SputnikDAO & Trezu Multisig Governance Integration
 * Documentation: https://github.com/near-daos/sputnik-dao-contract
 * Live Website: https://trezu.org / https://x.com/SputnikDAO
 * 
 * Used for corporate treasury governance: when an invoice or payment exceeds
 * the autonomous agent threshold ($500), PaySure AI creates an on-chain proposal
 * for the DAO council to review and approve.
 */

export const DEFAULT_SPUTNIK_DAO =
  process.env.NEXT_PUBLIC_SPUTNIK_DAO_CONTRACT || "paysure-council.sputnik-dao.testnet";

export interface SputnikProposalParams {
  daoContract?: string;
  description: string;
  receiverId: string;
  amountNear: number | string;
  tokenId?: string; // empty string "" for native NEAR
}

export function buildSputnikTransferProposal(params: SputnikProposalParams) {
  const {
    daoContract = DEFAULT_SPUTNIK_DAO,
    description,
    receiverId,
    amountNear,
    tokenId = "",
  } = params;

  // Convert NEAR to yoctoNEAR (1 NEAR = 10^24 yoctoNEAR)
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

  // SputnikDAO v2 standard proposal payload
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
    gas: "100000000000000", // 100 Tgas
    deposit: "100000000000000000000000", // 0.1 NEAR proposal bond
  };
}

