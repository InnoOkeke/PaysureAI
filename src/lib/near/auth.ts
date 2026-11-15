import crypto from "crypto";
import { utils } from "near-api-js";

const AUTH_SECRET =
  process.env.PAYSURE_AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "paysure-dev-ephemeral-secret-change-in-prod";

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RPC_URL =
  process.env.NEXT_PUBLIC_NEAR_NODE_URL || "https://rpc.testnet.fastnear.com";

export interface AuthChallenge {
  nonce: string; // 32-byte base64 nonce (matches NEP-413)
  message: string;
  recipient: string;
  issuedAt: number;
  expiresAt: number;
  token: string; // HMAC-signed stateless challenge token
}

export interface SignedRequestProof {
  accountId: string;
  publicKey: string;
  signature: string; // base64
  message: string;
  nonce: string; // base64 32-byte
  recipient: string;
  challengeToken: string;
}

/**
 * Issues a short-lived, HMAC-bound NEP-413 challenge for a NEAR account.
 */
export function createAuthChallenge(
  accountId: string,
  action: string,
  recipientApp = "paysure.ai"
): AuthChallenge {
  const cleanAccount = accountId.trim().toLowerCase();
  const nonceBytes = crypto.randomBytes(32);
  const nonce = nonceBytes.toString("base64");
  const issuedAt = Date.now();
  const expiresAt = issuedAt + CHALLENGE_TTL_MS;
  const message = `PaySure Registry Authorization\nAccount: ${cleanAccount}\nAction: ${action}\nIssuedAt: ${new Date(
    issuedAt
  ).toISOString()}`;

  const payload = JSON.stringify({
    accountId: cleanAccount,
    nonce,
    message,
    recipient: recipientApp,
    expiresAt,
  });
  const sig = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("base64url");
  const token = `${Buffer.from(payload).toString("base64url")}.${sig}`;

  return {
    nonce,
    message,
    recipient: recipientApp,
    issuedAt,
    expiresAt,
    token,
  };
}

/**
 * Computes the NEP-413 SHA-256 hash:
 * SHA256(u32_le(2^31 + 413) || borsh(Payload))
 */
function encodeBorshString(str: string): Buffer {
  const bytes = Buffer.from(str, "utf8");
  const len = Buffer.alloc(4);
  len.writeUInt32LE(bytes.length, 0);
  return Buffer.concat([len, bytes]);
}

function computeNep413Hash(params: {
  message: string;
  nonceBase64: string;
  recipient: string;
  callbackUrl?: string;
}): Uint8Array {
  const tag = Buffer.alloc(4);
  tag.writeUInt32LE(2147484061, 0); // 2^31 + 413

  const nonceBuf = Buffer.from(params.nonceBase64, "base64");
  if (nonceBuf.length !== 32) {
    throw new Error("Invalid NEP-413 nonce length (expected 32 bytes).");
  }

  const parts: Buffer[] = [
    tag,
    encodeBorshString(params.message),
    nonceBuf,
    encodeBorshString(params.recipient),
  ];

  if (params.callbackUrl) {
    parts.push(Buffer.from([1]));
    parts.push(encodeBorshString(params.callbackUrl));
  } else {
    parts.push(Buffer.from([0]));
  }

  return new Uint8Array(
    crypto.createHash("sha256").update(Buffer.concat(parts)).digest()
  );
}

/**
 * Verifies that `publicKey` is an active access key on `accountId` via NEAR RPC.
 */
async function verifyOnChainAccessKey(
  accountId: string,
  publicKey: string
): Promise<boolean> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "verify-access-key",
      method: "query",
      params: {
        request_type: "view_access_key",
        finality: "final",
        account_id: accountId,
        public_key: publicKey,
      },
    }),
    signal: AbortSignal.timeout(5000),
  });
  const json = await res.json();
  return Boolean(json?.result && typeof json.result.nonce === "number");
}

/**
 * Verifies a signed NEP-413 challenge proof against:
 * 1) Server HMAC token + expiration
 * 2) Cryptographic ed25519 signature over the NEP-413 payload
 * 3) On-chain NEAR RPC `view_access_key` ownership check
 */
export async function verifySignedNearProof(
  proof: SignedRequestProof
): Promise<{ valid: boolean; accountId: string; error?: string }> {
  try {
    const cleanAccount = proof.accountId?.trim().toLowerCase();
    if (!cleanAccount || !proof.challengeToken || !proof.signature || !proof.publicKey) {
      return { valid: false, accountId: "", error: "Missing cryptographic signature fields." };
    }

    const [encodedPayload, hmacSig] = proof.challengeToken.split(".");
    if (!encodedPayload || !hmacSig) {
      return { valid: false, accountId: "", error: "Malformed challenge token." };
    }

    const payloadJson = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const expectedHmac = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(payloadJson)
      .digest("base64url");

    const sigA = Buffer.from(hmacSig);
    const sigB = Buffer.from(expectedHmac);
    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      return { valid: false, accountId: "", error: "Invalid challenge token signature." };
    }

    const parsed = JSON.parse(payloadJson);
    if (Date.now() > Number(parsed.expiresAt)) {
      return { valid: false, accountId: "", error: "Challenge expired. Please sign again." };
    }

    if (
      parsed.accountId !== cleanAccount ||
      parsed.nonce !== proof.nonce ||
      parsed.message !== proof.message ||
      parsed.recipient !== proof.recipient
    ) {
      return { valid: false, accountId: "", error: "Signed challenge does not match request." };
    }

    const hash = computeNep413Hash({
      message: proof.message,
      nonceBase64: proof.nonce,
      recipient: proof.recipient,
    });

    const pubKey = utils.PublicKey.fromString(proof.publicKey);
    const sigBytes = new Uint8Array(Buffer.from(proof.signature, "base64"));
    const isSigValid = pubKey.verify(hash, sigBytes);
    if (!isSigValid) {
      return { valid: false, accountId: "", error: "NEP-413 signature verification failed." };
    }

    const keyOwnedOnChain = await verifyOnChainAccessKey(cleanAccount, proof.publicKey);
    if (!keyOwnedOnChain) {
      return {
        valid: false,
        accountId: "",
        error: `Public key ${proof.publicKey} is not an active access key for ${cleanAccount} on NEAR.`,
      };
    }

    return { valid: true, accountId: cleanAccount };
  } catch (err: any) {
    return {
      valid: false,
      accountId: "",
      error: err?.message || "Signature verification error.",
    };
  }
}
