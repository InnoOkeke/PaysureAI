const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaySure Smart Contracts on Aevum Testnet Standard", function () {
  let recipientRegistry;
  let paySurePayments;
  let mockToken;
  let owner;
  let payer;
  let payee;
  let maliciousUser;

  const TUSD8_DECIMALS = 6;
  const parseTUSD8 = (val) => ethers.parseUnits(val.toString(), TUSD8_DECIMALS);

  beforeEach(async function () {
    [owner, payer, payee, maliciousUser] = await ethers.getSigners();

    // 1. Deploy RecipientRegistry
    const RecipientRegistryFactory = await ethers.getContractFactory("RecipientRegistry");
    recipientRegistry = await RecipientRegistryFactory.deploy();
    await recipientRegistry.waitForDeployment();

    // 2. Deploy Mock tUSD8 (6 decimals)
    const MockTokenFactory = await ethers.getContractFactory("MockTUSD8");
    mockToken = await MockTokenFactory.deploy();
    await mockToken.waitForDeployment();

    // 3. Deploy PaySurePayments pointing to Mock tUSD8
    const PaySurePaymentsFactory = await ethers.getContractFactory("PaySurePayments");
    paySurePayments = await PaySurePaymentsFactory.deploy(await mockToken.getAddress());
    await paySurePayments.waitForDeployment();

    // Fund payer with 5,000 tUSD8
    await mockToken.mint(payer.address, parseTUSD8(5000));
  });

  describe("RecipientRegistry (Confirmation of Payee)", function () {
    it("should allow a recipient to register payment profile", async function () {
      await expect(
        recipientRegistry.connect(payee).registerRecipient("acme-design", "Acme Design Studio")
      )
        .to.emit(recipientRegistry, "RecipientRegistered")
        .withArgs(payee.address, "acme-design", "Acme Design Studio", (val) => val > 0);

      const profile = await recipientRegistry.getRecipient(payee.address);
      expect(profile.wallet).to.equal(payee.address);
      expect(profile.paymentId).to.equal("acme-design");
      expect(profile.displayName).to.equal("Acme Design Studio");
      expect(profile.isVerified).to.be.false;
      expect(profile.isActive).to.be.true;
    });

    it("should prevent duplicate registration of paymentId", async function () {
      await recipientRegistry.connect(payee).registerRecipient("studio-id", "Original Studio");

      await expect(
        recipientRegistry.connect(maliciousUser).registerRecipient("studio-id", "Fake Studio")
      ).to.be.revertedWithCustomError(recipientRegistry, "PaymentIdTaken");
    });

    it("should allow owner to attest verification status", async function () {
      await recipientRegistry.connect(payee).registerRecipient("payee-1", "Verified Payee");
      await recipientRegistry.connect(owner).setVerificationStatus(payee.address, true);

      const profile = await recipientRegistry.getRecipient(payee.address);
      expect(profile.isVerified).to.be.true;
    });

    it("should allow recipient to update or revoke registration", async function () {
      await recipientRegistry.connect(payee).registerRecipient("payee-2", "Old Name");
      await recipientRegistry.connect(payee).updateRecipient("New Name");

      let profile = await recipientRegistry.getRecipient(payee.address);
      expect(profile.displayName).to.equal("New Name");

      await recipientRegistry.connect(payee).revokeRecipient();
      profile = await recipientRegistry.getRecipient(payee.address);
      expect(profile.isActive).to.be.false;
    });
  });

  describe("PaySurePayments (Safe tUSD8 Transfers)", function () {
    it("should process tUSD8 payment with invoice reference", async function () {
      const amount = parseTUSD8(500); // 500 tUSD8 (6 decimals)
      const invoiceRef = "INV-2026-AEVUM-001";

      // Approve contract
      await mockToken.connect(payer).approve(await paySurePayments.getAddress(), amount);

      // Execute payment
      await expect(
        paySurePayments.connect(payer).makePayment(payee.address, amount, invoiceRef)
      )
        .to.emit(paySurePayments, "PaymentExecuted")
        .withArgs(
          (val) => val.length === 66,
          payer.address,
          payee.address,
          amount,
          invoiceRef,
          (val) => val > 0
        );

      // Check balances
      expect(await mockToken.balanceOf(payee.address)).to.equal(amount);
      expect(await mockToken.balanceOf(payer.address)).to.equal(parseTUSD8(4500));

      // Query record by invoice reference
      const record = await paySurePayments.getPaymentByReference(invoiceRef);
      expect(record.sender).to.equal(payer.address);
      expect(record.recipient).to.equal(payee.address);
      expect(record.amount).to.equal(amount);
      expect(record.invoiceReference).to.equal(invoiceRef);
    });

    it("should prevent duplicate payment on same invoice reference", async function () {
      const amount = parseTUSD8(200);
      const invoiceRef = "INV-2026-UNIQUE";

      await mockToken.connect(payer).approve(await paySurePayments.getAddress(), parseTUSD8(1000));
      await paySurePayments.connect(payer).makePayment(payee.address, amount, invoiceRef);

      await expect(
        paySurePayments.connect(payer).makePayment(payee.address, amount, invoiceRef)
      ).to.be.revertedWithCustomError(paySurePayments, "InvoiceAlreadySettled");
    });

    it("should revert if recipient is zero address or sender", async function () {
      const amount = parseTUSD8(100);
      await mockToken.connect(payer).approve(await paySurePayments.getAddress(), amount);

      await expect(
        paySurePayments.connect(payer).makePayment(ethers.ZeroAddress, amount, "REF-1")
      ).to.be.revertedWithCustomError(paySurePayments, "InvalidAddress");

      await expect(
        paySurePayments.connect(payer).makePayment(payer.address, amount, "REF-2")
      ).to.be.revertedWithCustomError(paySurePayments, "InvalidAddress");
    });
  });
});

