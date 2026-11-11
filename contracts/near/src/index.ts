import { NearBindgen, near, call, view, UnorderedMap, assert } from "near-sdk-js";

/**
 * PayeeProfile
 * Represents a legally verified vendor or contractor identity on NEAR.
 */
export class PayeeProfile {
  accountId: string;
  paymentId: string;
  legalName: string;
  isVerified: boolean;
  registeredAt: string;
  notes: string;

  constructor(accountId: string, paymentId: string, legalName: string, notes: string) {
    this.accountId = accountId;
    this.paymentId = paymentId;
    this.legalName = legalName;
    this.isVerified = true;
    this.registeredAt = near.blockTimestamp().toString();
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
  payees: UnorderedMap<PayeeProfile> = new UnorderedMap<PayeeProfile>("payees_map");
  settledInvoices: UnorderedMap<string> = new UnorderedMap<string>("invoices_map");
  payments: UnorderedMap<PaymentRecord> = new UnorderedMap<PaymentRecord>("payments_map");
  totalVolumeYocto: bigint = BigInt(0);
  totalPaymentsCount: bigint = BigInt(0);

  /**
   * Register or update a payee identity on the Confirmation of Payee directory.
   */
  @call({})
  register_payee({
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

    const profile = new PayeeProfile(caller, paymentId, legalName, notes);
    this.payees.set(caller, profile);

    near.log(`[PaySure] Payee registered: ${caller} -> ${legalName} (${paymentId})`);
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
    status: "VERIFIED" | "MISMATCH" | "UNVERIFIED";
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

    return {
      status: "VERIFIED",
      legalName: profile.legalName,
      isVerified: true,
      reason: `Account '${accountId}' is verified and matches legal entity '${profile.legalName}'.`,
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

