import { describe, expect, it } from "vitest";
import { parseDeterministic } from "../src/intent/deterministic-parser";

describe("parseDeterministic", () => {
  it("parses amount-first payment intents with a destination chain", () => {
    const result = parseDeterministic("Send $50 to John Kennedy on Base");

    expect(result).toMatchObject({
      action: "pay",
      amount: 50,
      currency: "USD",
      recipientQuery: "John Kennedy",
      targetChain: "Base",
    });
  });

  it("parses payee-first payment intents", () => {
    const result = parseDeterministic("Pay Acme Design 75 NEAR");

    expect(result).toMatchObject({
      action: "pay",
      amount: 75,
      currency: "NEAR",
      recipientQuery: "Acme Design",
      targetChain: "NEAR Protocol",
    });
  });

  it("parses payee verification requests", () => {
    expect(parseDeterministic("verify acme-design.testnet")).toMatchObject({
      action: "verify_payee",
      accountId: "acme-design.testnet",
    });

    expect(parseDeterministic("Is satoshi-dev.testnet verified?")).toMatchObject({
      action: "verify_payee",
      accountId: "satoshi-dev.testnet",
    });
  });

  it("parses invoice status questions", () => {
    expect(parseDeterministic("show my pending invoices")).toMatchObject({
      action: "invoice_status",
      status: "PENDING",
    });
  });

  it("parses explicit navigation", () => {
    expect(parseDeterministic("open treasury")).toMatchObject({
      action: "navigate",
      page: "treasury",
    });
  });

  it("asks for clarification on incomplete payments", () => {
    expect(parseDeterministic("pay acme")).toMatchObject({
      action: "clarify",
    });
  });

  it("returns null for general conversation", () => {
    expect(parseDeterministic("hello, what can you do?")).toBeNull();
  });
});
