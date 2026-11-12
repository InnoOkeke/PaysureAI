import { describe, expect, it } from "vitest";
import { RecipientsService } from "../src/recipients/recipients.service";

const service = new RecipientsService({} as never, {} as never);

describe("RecipientsService.detectChainFromAddress", () => {
  it("detects EVM addresses", () => {
    expect(service.detectChainFromAddress("0x71C8360f3a8b417c805F99D4133A89f07447d251")).toMatchObject({
      chain: "Base / Ethereum (EVM)",
      rail: "NEAR Chain Signatures (MPC)",
    });
  });

  it("detects Bitcoin addresses", () => {
    expect(service.detectChainFromAddress("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4")).toMatchObject({
      chain: "Bitcoin",
      rail: "NEAR Chain Signatures (MPC)",
    });
  });

  it("detects Solana addresses", () => {
    expect(service.detectChainFromAddress("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU")).toMatchObject({
      chain: "Solana",
      rail: "NEAR Intent Solver (Model A)",
    });
  });

  it("detects XRP addresses", () => {
    expect(service.detectChainFromAddress("r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59")).toMatchObject({
      chain: "Ripple (XRP)",
      rail: "NEAR Intent Solver (Model A)",
    });
  });

  it("detects Stacks addresses before Bitcoin in canonical names", () => {
    expect(service.detectChainFromAddress("SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS")).toMatchObject({
      chain: "Stacks (Bitcoin L2)",
      rail: "NEAR Intent Solver (Model A)",
    });
  });

  it("falls back to NEAR", () => {
    expect(service.detectChainFromAddress("realdezzy.testnet")).toMatchObject({
      chain: "NEAR Protocol",
      rail: "NEAR Native",
    });
  });
});
