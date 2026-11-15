export interface DomainAttestationResult {
  verified: boolean;
  domain: string;
  walletAddress: string;
  expectedRecordHost: string;
  expectedRecordValue: string;
  matchedHost?: string;
  foundRecords: string[];
  checkedAt: string;
  method: "cloudflare-doh" | "google-doh" | "invalid-input";
  error?: string;
}

const DOMAIN_REGEX = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

export function normalizeVendorDomain(rawDomain: string): string | null {
  if (!rawDomain || typeof rawDomain !== "string") return null;
  let cleaned = rawDomain.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
  cleaned = cleaned.replace(/^www\./, "").replace(/\.$/, "");
  if (!cleaned || cleaned.length > 253) return null;
  if (cleaned === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(cleaned)) return null;
  if (!DOMAIN_REGEX.test(cleaned)) return null;
  return cleaned;
}

export function expectedPaySureTxtRecord(domain: string, walletAddress: string) {
  const cleanDomain = normalizeVendorDomain(domain) || domain.trim().toLowerCase();
  const cleanWallet = walletAddress.trim().toLowerCase();
  return {
    host: `_paysure.${cleanDomain}`,
    value: `paysure-verify=${cleanWallet}`,
  };
}

async function queryTxtViaGoogleDoH(hostname: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=TXT`,
      {
        headers: { Accept: "application/dns-json" },
        cache: "no-store",
        signal: AbortSignal.timeout(4500),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const answers: Array<{ type: number; data: string }> = Array.isArray(data?.Answer)
      ? data.Answer
      : [];
    return answers
      .filter((a) => a.type === 16 && typeof a.data === "string")
      .map((a) => a.data.replace(/^"|"$/g, "").replace(/"\s*"/g, "").trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function queryTxtViaDoH(hostname: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=TXT`,
      {
        headers: { Accept: "application/dns-json" },
        cache: "no-store",
        signal: AbortSignal.timeout(4500),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const answers: Array<{ type: number; data: string }> = Array.isArray(data?.Answer)
      ? data.Answer
      : [];
    return answers
      .filter((a) => a.type === 16 && typeof a.data === "string")
      .map((a) => a.data.replace(/^"|"$/g, "").replace(/"\s*"/g, "").trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Verifies Trust-on-First-Use (TOFU) cryptographic domain ownership:
 * Checks `_paysure.<domain>` (and root `<domain>` fallback) for a DNS TXT record
 * matching `paysure-verify=<walletAddress>`.
 */
export async function verifyVendorDomainTxt(
  rawDomain: string,
  walletAddress: string
): Promise<DomainAttestationResult> {
  const checkedAt = new Date().toISOString();
  const cleanWallet = walletAddress.trim().toLowerCase();
  const domain = normalizeVendorDomain(rawDomain);

  if (!domain || !cleanWallet) {
    return {
      verified: false,
      domain: rawDomain,
      walletAddress: cleanWallet,
      expectedRecordHost: `_paysure.${rawDomain}`,
      expectedRecordValue: `paysure-verify=${cleanWallet}`,
      foundRecords: [],
      checkedAt,
      method: "invalid-input",
      error: "Invalid vendor domain format (expected e.g. acme-design.com).",
    };
  }

  const expected = expectedPaySureTxtRecord(domain, cleanWallet);
  const candidates = [expected.host, domain];
  const allFound: string[] = [];

  for (const host of candidates) {
    const dohRecords = await queryTxtViaDoH(host);
    allFound.push(...dohRecords);
    if (dohRecords.some((r) => r.toLowerCase() === expected.value)) {
      return {
        verified: true,
        domain,
        walletAddress: cleanWallet,
        expectedRecordHost: expected.host,
        expectedRecordValue: expected.value,
        matchedHost: host,
        foundRecords: Array.from(new Set(allFound)),
        checkedAt,
        method: "cloudflare-doh",
      };
    }
  }

  for (const host of candidates) {
    const googleRecords = await queryTxtViaGoogleDoH(host);
    allFound.push(...googleRecords);
    if (googleRecords.some((r) => r.toLowerCase() === expected.value)) {
      return {
        verified: true,
        domain,
        walletAddress: cleanWallet,
        expectedRecordHost: expected.host,
        expectedRecordValue: expected.value,
        matchedHost: host,
        foundRecords: Array.from(new Set(allFound)),
        checkedAt,
        method: "google-doh",
      };
    }
  }

  return {
    verified: false,
    domain,
    walletAddress: cleanWallet,
    expectedRecordHost: expected.host,
    expectedRecordValue: expected.value,
    foundRecords: Array.from(new Set(allFound)),
    checkedAt,
    method: "cloudflare-doh",
    error: `DNS TXT record not found. Publish ${expected.host} TXT "${expected.value}" on your vendor's DNS.`,
  };
}
