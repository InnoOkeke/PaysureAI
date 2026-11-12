import { VerificationTier } from "../near/near.service";

export interface CounterpartyRecord {
  id: string;
  displayName: string;
  paymentId: string;
  walletAddress: string;
  evmAddress?: string;
  bitcoinAddress?: string;
  solanaAddress?: string;
  xrpAddress?: string;
  cosmosAddress?: string;
  stacksAddress?: string;
  stellarAddress?: string;
  verificationStatus: VerificationTier;
  notes?: string;
  isOfficialPartner?: boolean;
  transactionCount?: number;
}

export const DEFAULT_RECIPIENTS: CounterpartyRecord[] = [
  {
    id: "rec-leprof-1",
    displayName: "LeProf Consulting",
    paymentId: "leprof",
    walletAddress: "leprof.testnet",
    evmAddress: "0x71C8360f3a8b417c805F99D4133A89f07447d251",
    bitcoinAddress: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
    solanaAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    xrpAddress: "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
    cosmosAddress: "cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0e846pc54",
    stacksAddress: "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS",
    stellarAddress: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
    verificationStatus: "VERIFIED",
    notes: "Attested corporate counterparty across NEAR, Base, Bitcoin, Solana, XRP, Cosmos, Stacks, and Stellar.",
    isOfficialPartner: true,
    transactionCount: 19,
  },
  {
    id: "rec-acme-2",
    displayName: "Acme Web3 Design Studio",
    paymentId: "acme-design",
    walletAddress: "acme-design.testnet",
    evmAddress: "0x456569838f1d43009A91ebA4263147Afd7233483",
    bitcoinAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    solanaAddress: "Acme482kXz9vQ7wPzN9bL1m9k6qR8s2vY5t1u4w3x2z1",
    xrpAddress: "rEb8TK3gBgk5auZyyb6BiZN2rk3bU26GLq",
    cosmosAddress: "cosmos1depduwvh4572h7w54cv92z567l523mvhz738q9",
    stacksAddress: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    stellarAddress: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    verificationStatus: "VERIFIED",
    notes: "Official NEAR Ecosystem Design Partner. Multi-chain corporate treasury.",
    isOfficialPartner: true,
    transactionCount: 14,
  },
  {
    id: "rec-satoshi-3",
    displayName: "Satoshi Freelance Engineering",
    paymentId: "satoshi-dev",
    walletAddress: "satoshi-dev.testnet",
    evmAddress: "0x1234567890123456789012345678901234567890",
    bitcoinAddress: "bc1q9d784a0c849e89d6e872c3d5236894c2518e91",
    solanaAddress: "Satosh19428571829471928471928471928471928471",
    xrpAddress: "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
    cosmosAddress: "cosmos1vl9e25dkls8923mxc78dfhk235689123456789",
    stacksAddress: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
    stellarAddress: "GCKFBEIYV2U22IO2GUOWGOQUM76ACQOMZBPZFDB2O7AFB9M72G8K7KNA",
    verificationStatus: "VERIFIED",
    notes: "Smart Contract auditor & Rust / NEAR / Solana / Bitcoin systems specialist.",
    isOfficialPartner: false,
    transactionCount: 8,
  },
  {
    id: "rec-john-4",
    displayName: "John Kennedy",
    paymentId: "john-kennedy",
    walletAddress: "john-kennedy.testnet",
    evmAddress: "0x71C8360f3a8b417c805F99D4133A89f07447d251",
    bitcoinAddress: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
    solanaAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    xrpAddress: "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
    cosmosAddress: "cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0e846pc54",
    stacksAddress: "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS",
    stellarAddress: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
    verificationStatus: "VERIFIED",
    notes: "Verified individual counterparty across supported settlement rails.",
    isOfficialPartner: true,
    transactionCount: 8,
  },
  {
    id: "rec-apex-5",
    displayName: "Apex Media Agency",
    paymentId: "apex-media",
    walletAddress: "apex-media.testnet",
    evmAddress: "0x9999999999999999999999999999999999999999",
    verificationStatus: "WARNING",
    notes: "Recent key rotation reported by payee. Exercise caution.",
    isOfficialPartner: false,
    transactionCount: 2,
  },
];

export function recipientAddresses(record: CounterpartyRecord): string[] {
  return [
    record.walletAddress,
    record.evmAddress,
    record.bitcoinAddress,
    record.solanaAddress,
    record.xrpAddress,
    record.cosmosAddress,
    record.stacksAddress,
    record.stellarAddress,
  ].filter((value): value is string => Boolean(value));
}
