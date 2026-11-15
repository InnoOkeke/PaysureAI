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

export interface SputnikRegistryProposalParams {
  daoContract?: string;
  changeId: string;
  paymentId: string;
  displayName: string;
  changeType: "NEW_REGISTRATION" | "ADDRESS_UPDATE";
  requestedBy: string;
  targetWallet: string;
}

export const PAYSURE_REGISTRY_CONTRACT =
  process.env.NEXT_PUBLIC_PAYSURE_CONTRACT_ID || "paysure-registry.testnet";

export function buildSputnikRegistryProposal(params: SputnikRegistryProposalParams) {
  const {
    daoContract = DEFAULT_SPUTNIK_DAO,
    changeId,
    paymentId,
    displayName,
    changeType,
    requestedBy,
    targetWallet,
  } = params;

  const actionLabel =
    changeType === "NEW_REGISTRATION" ? "Verify New Payee" : "Approve Payee Key Rotation";

  const callArgs = JSON.stringify({
    accountId: targetWallet,
    paymentId,
    legalName: displayName,
    notes: `${actionLabel} | ChangeID: ${changeId} | RequestedBy: ${requestedBy}`,
    triggerCooldown: changeType === "ADDRESS_UPDATE",
  });

  return {
    contractId: daoContract,
    methodName: "add_proposal",
    args: {
      proposal: {
        description: `[PaySure Registry: ${actionLabel}] ${displayName} (${paymentId}) -> ${targetWallet} | ChangeID: ${changeId} | RequestedBy: ${requestedBy}`,
        kind: {
          FunctionCall: {
            receiver_id: PAYSURE_REGISTRY_CONTRACT,
            actions: [
              {
                method_name: "set_verified_payee",
                args: Buffer.from(callArgs, "utf8").toString("base64"),
                deposit: "0",
                gas: "50000000000000",
              },
            ],
          },
        },
      },
    },
    gas: "100000000000000",
    deposit: "100000000000000000000000",
  };
}

interface CouncilCache {
  members: string[];
  source: "on-chain" | "env" | "unavailable";
  fetchedAt: number;
  error?: string;
}

let councilCache: CouncilCache | null = null;
const COUNCIL_CACHE_TTL_MS = 60_000;

export async function getSputnikCouncilMembers(forceRefresh = false): Promise<{
  daoContract: string;
  members: string[];
  source: "on-chain" | "env" | "unavailable";
  error?: string;
}> {
  const now = Date.now();
  if (!forceRefresh && councilCache && now - councilCache.fetchedAt < COUNCIL_CACHE_TTL_MS) {
    return {
      daoContract: DEFAULT_SPUTNIK_DAO,
      members: councilCache.members,
      source: councilCache.source,
      error: councilCache.error,
    };
  }

  const rpcUrl = process.env.NEXT_PUBLIC_NEAR_NODE_URL || "https://rpc.testnet.fastnear.com";

  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "sputnik-get-policy",
        method: "query",
        params: {
          request_type: "call_function",
          finality: "final",
          account_id: DEFAULT_SPUTNIK_DAO,
          method_name: "get_policy",
          args_base64: "e30=",
        },
      }),
      signal: AbortSignal.timeout(5000),
    });

    const json = await res.json();
    if (json?.result?.result && Array.isArray(json.result.result)) {
      const bytes = new Uint8Array(json.result.result);
      const policy = JSON.parse(new TextDecoder().decode(bytes));
      const roles: any[] = Array.isArray(policy?.roles) ? policy.roles : [];
      const councilMembers = new Set<string>();

      for (const role of roles) {
        const roleName = String(role?.name || "").toLowerCase();
        if (roleName === "council" && Array.isArray(role?.kind?.Group)) {
          for (const m of role.kind.Group) {
            if (typeof m === "string" && m.trim()) {
              councilMembers.add(m.trim().toLowerCase());
            }
          }
        }
      }

      const members = Array.from(councilMembers);
      if (members.length > 0) {
        councilCache = { members, source: "on-chain", fetchedAt: now };
        return { daoContract: DEFAULT_SPUTNIK_DAO, members, source: "on-chain" };
      }
    }

    const rpcErr = json?.error?.data || json?.error?.message || "No council role found on DAO contract";
    throw new Error(typeof rpcErr === "string" ? rpcErr : JSON.stringify(rpcErr));
  } catch (err: any) {
    const envRaw = process.env.PAYSURE_REGISTRY_APPROVERS || "";
    const envMembers = envRaw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (envMembers.length > 0) {
      councilCache = {
        members: envMembers,
        source: "env",
        fetchedAt: now,
        error: err?.message,
      };
      return {
        daoContract: DEFAULT_SPUTNIK_DAO,
        members: envMembers,
        source: "env",
        error: err?.message,
      };
    }

    councilCache = {
      members: [],
      source: "unavailable",
      fetchedAt: now,
      error: err?.message || "Failed to query SputnikDAO policy",
    };
    return {
      daoContract: DEFAULT_SPUTNIK_DAO,
      members: [],
      source: "unavailable",
      error: councilCache.error,
    };
  }
}

