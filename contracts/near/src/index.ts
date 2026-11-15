import { NearBindgen, near, call, view, UnorderedMap, assert } from "near-sdk-js";

/**
 * PayeeProfile
 * Represents a legally verified vendor or contractor identity on NEAR.
 */
export class PayeeProfile {
  accountId: string;
  paymentId: string;
  legalName: string;
  status: "VERIFIED" | "WARNING" | "UNVERIFIED";
  isVerified: boolean;
  registeredAt: string;
  cooldownUntil: string;
  proposedBy: string;
  approvedBy: string;
  notes: string;

  constructor(
    accountId: string,
    paymentId: string,
    legalName: string,
    notes: string,
    status: "VERIFIED" | "WARNING" | "UNVERIFIED" = "UNVERIFIED",
    proposedBy = "",
    approvedBy = "",
    cooldownUntil = "0"
  ) {
    this.accountId = accountId;
    this.paymentId = paymentId;
    this.legalName = legalName;
    this.status = status;
    this.isVerified = status === "VERIFIED";
    this.registeredAt = near.blockTimestamp().toString();
    this.cooldownUntil = cooldownUntil;
    this.proposedBy = proposedBy;
    this.approvedBy = approvedBy;
    this.notes = notes;
  }
}

/**
 * PaymentRecord
 * On-chain audit trail linking a NEAR settlement to an invoice reference.
 */
export class PaymentRecord {
  paymentId: string;
  sender: string;
  recipient: string;
  amountYocto: string;
  invoiceReference: string;
  timestamp: string;
  blockHeight: string;

  constructor(
    paymentId: string,
    sender: string,
    recipient: string,
    amountYocto: string,
    invoiceReference: string
  ) {
    this.paymentId = paymentId;
    this.sender = sender;
    this.recipient = recipient;
    this.amountYocto = amountYocto;
    this.invoiceReference = invoiceReference;
    this.timestamp = near.blockTimestamp().toString();
    this.blockHeight = near.blockHeight().toString();
  }
}

/**
 * PaySureContract
 * Native NEAR Confirmation of Payee & Autonomous Invoice Settlement Smart Contract.
 */
@NearBindgen({})
export class PaySureContract {
  daoContract: string = "paysure-council.sputnik-dao.testnet";
  payees: UnorderedMap<PayeeProfile> = new UnorderedMap<PayeeProfile>("payees_map");
  settledInvoices: UnorderedMap<string> = new UnorderedMap<string>("invoices_map");
  payments: UnorderedMap<PaymentRecord> = new UnorderedMap<PaymentRecord>("payments_map");
  totalVolumeYocto: bigint = BigInt(0);
  totalPaymentsCount: bigint = BigInt(0);

  /**
   * Configure the governing SputnikDAO contract (can only be updated by the current DAO).
   */
  @call({})
  set_dao_contract({ daoContract }: { daoContract: string }): string {
    const caller = near.predecessorAccountId();
    assert(
      caller === this.daoContract || caller === near.currentAccountId(),
      "Only current SputnikDAO or contract deployer can update daoContract"
    );
    assert(daoContract.length > 0, "daoContract cannot be empty");
    this.daoContract = daoContract;
    return this.daoContract;
  }

  /**
   * Propose a new payee identity (starts UNVERIFIED; cannot overwrite an existing VERIFIED payee).
   */
  @call({})
  propose_payee({
    paymentId,
    legalName,
    notes = "",
  }: {
    paymentId: string;
    legalName: string;
    notes?: string;
  }): PayeeProfile {
    const caller = near.predecessorAccountId();
    assert(paymentId.length > 0, "Payment ID cannot be empty");
    assert(legalName.length > 0, "Legal entity name cannot be empty");

    const existing = this.payees.get(caller);
    assert(
      !existing || existing.status === "UNVERIFIED",
      "Verified payee already exists; updates must pass through SputnikDAO council proposal"
    );

    const profile = new PayeeProfile(
      caller,
      paymentId,
      legalName,
      notes,
      "UNVERIFIED",
      caller,
      ""
    );
    this.payees.set(caller, profile);

    near.log(`[PaySure] Payee proposed (UNVERIFIED): ${caller} -> ${legalName} (${paymentId})`);
    return profile;
  }

  /**
   * Verify or update a payee identity on-chain.
   * STRICTLY GATED: Only callable by the SputnikDAO multisig contract after council vote.
   */
  @call({})
  set_verified_payee({
    accountId,
    paymentId,
    legalName,
    notes = "",
    triggerCooldown = false,
  }: {
    accountId: string;
    paymentId: string;
    legalName: string;
    notes?: string;
    triggerCooldown?: boolean;
  }): PayeeProfile {
    const caller = near.predecessorAccountId();
    assert(
      caller === this.daoContract,
      `Unauthorized: only SputnikDAO (${this.daoContract}) can verify or update payees`
    );
    assert(accountId.length > 1, "Invalid accountId");
    assert(paymentId.length > 0, "Payment ID cannot be empty");
    assert(legalName.length > 0, "Legal entity name cannot be empty");

    const existing = this.payees.get(accountId);
    const isRotation = Boolean(existing && triggerCooldown);
    const cooldownNs = isRotation
      ? (near.blockTimestamp() + BigInt(24) * BigInt(60) * BigInt(60) * BigInt(1_000_000_000)).toString()
      : "0";

    const profile = new PayeeProfile(
      accountId,
      paymentId,
      legalName,
      notes,
      isRotation ? "WARNING" : "VERIFIED",
      existing?.proposedBy || caller,
      caller,
      cooldownNs
    );
    this.payees.set(accountId, profile);

    near.log(
      `[PaySure DAO] Payee ${isRotation ? "rotated (24h WARNING)" : "VERIFIED"} by ${caller}: ${accountId} -> ${legalName}`
    );
    return profile;
  }

  /**
   * Settle an invoice with attached native NEAR deposit.
   * Prevents duplicate payments for the same invoice reference.
   */
  @call({ payableFunction: true })
  pay_invoice({
    recipientId,
    invoiceReference,
  }: {
    recipientId: string;
    invoiceReference: string;
  }): string {
    const sender = near.predecessorAccountId();
    const deposit = near.attachedDeposit();

    assert(deposit > BigInt(0), "Payment deposit must be greater than 0");
    assert(recipientId !== sender, "Cannot pay oneself");
    assert(recipientId.length > 1, "Invalid recipient account");

    // Duplicate invoice prevention
    if (invoiceReference.length > 0) {
      const existing = this.settledInvoices.get(invoiceReference);
      assert(!existing, `Invoice '${invoiceReference}' has already been settled on-chain`);
    }

    // Transfer attached deposit to recipient
    const promise = near.promiseBatchCreate(recipientId);
    near.promiseBatchActionTransfer(promise, deposit);

    // Unique deterministic payment hash
    const paymentId = `PAY-${near.blockHeight().toString()}-${invoiceReference || "DIRECT"}`;

    const record = new PaymentRecord(
      paymentId,
      sender,
      recipientId,
      deposit.toString(),
      invoiceReference
    );

    this.payments.set(paymentId, record);
    if (invoiceReference.length > 0) {
      this.settledInvoices.set(invoiceReference, paymentId);
    }

    this.totalVolumeYocto += deposit;
    this.totalPaymentsCount += BigInt(1);

    near.log(
      `[PaySure Settlement] ${sender} paid ${deposit.toString()} yoctoNEAR to ${recipientId} for invoice ${invoiceReference}`
    );

    return paymentId;
  }

  // ==================== VIEW METHODS ====================

  /**
   * Look up a payee's verification profile by NEAR Account ID.
   */
  @view({})
  get_payee({ accountId }: { accountId: string }): PayeeProfile | null {
    return this.payees.get(accountId) || null;
  }

  /**
   * Confirmation of Payee verification engine.
   * Compares the expected legal name with the registered on-chain identity.
   */
  @view({})
  verify_payee({
    accountId,
    expectedName,
  }: {
    accountId: string;
    expectedName?: string;
  }): {
    status: "VERIFIED" | "WARNING" | "MISMATCH" | "UNVERIFIED";
    legalName: string | null;
    isVerified: boolean;
    reason: string;
  } {
    const profile = this.payees.get(accountId);

    if (!profile) {
      return {
        status: "UNVERIFIED",
        legalName: null,
        isVerified: false,
        reason: `Account '${accountId}' is not registered in the PaySure Confirmation of Payee registry.`,
      };
    }

    if (profile.status === "UNVERIFIED") {
      return {
        status: "UNVERIFIED",
        legalName: profile.legalName,
        isVerified: false,
        reason: `Account '${accountId}' (${profile.legalName}) is pending SputnikDAO council verification.`,
      };
    }

    if (
      expectedName &&
      expectedName.trim().length > 0 &&
      profile.legalName.toLowerCase() !== expectedName.trim().toLowerCase()
    ) {
      return {
        status: "MISMATCH",
        legalName: profile.legalName,
        isVerified: false,
        reason: `CRITICAL MISMATCH: Invoice names payee as '${expectedName}', but account '${accountId}' is registered to '${profile.legalName}'. Do not proceed!`,
      };
    }

    if (
      profile.status === "WARNING" ||
      (profile.cooldownUntil && BigInt(profile.cooldownUntil) > near.blockTimestamp())
    ) {
      return {
        status: "WARNING",
        legalName: profile.legalName,
        isVerified: false,
        reason: `Key rotation cooldown active for '${profile.legalName}' (${accountId}). Exercise caution before sending funds.`,
      };
    }

    return {
      status: "VERIFIED",
      legalName: profile.legalName,
      isVerified: true,
      reason: `Account '${accountId}' is verified by SputnikDAO and matches legal entity '${profile.legalName}'.`,
    };
  }

  /**
   * Check if an invoice has already been settled.
   */
  @view({})
  is_invoice_settled({ invoiceReference }: { invoiceReference: string }): boolean {
    return !!this.settledInvoices.get(invoiceReference);
  }

  /**
   * Retrieve an audit record by paymentId.
   */
  @view({})
  get_payment({ paymentId }: { paymentId: string }): PaymentRecord | null {
    return this.payments.get(paymentId) || null;
  }

  /**
   * Protocol statistics.
   */
  @view({})
  get_protocol_stats(): {
    totalVolumeYocto: string;
    totalPaymentsCount: string;
  } {
    return {
      totalVolumeYocto: this.totalVolumeYocto.toString(),
      totalPaymentsCount: this.totalPaymentsCount.toString(),
    };
  }
}

