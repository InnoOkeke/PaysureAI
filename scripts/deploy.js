const { ethers } = require("hardhat");

async function main() {
  console.log("----------------------------------------------------");
  console.log("Deploying PaySure AI Smart Contracts to QDay Aevum Testnet...");
  console.log("----------------------------------------------------");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer Address:", deployer.address);

  // Official tUSD8 Token on QDay Aevum Testnet
  const TUSD8_ADDRESS =
    process.env.NEXT_PUBLIC_TUSD8_ADDRESS || "0x456569838f1d43009A91ebA4263147Afd7233483";

  console.log("Target tUSD8 Token Address:", TUSD8_ADDRESS);

  // 1. Deploy RecipientRegistry
  console.log("\n1. Deploying RecipientRegistry (Confirmation of Payee)...");
  const RecipientRegistry = await ethers.getContractFactory("RecipientRegistry");
  const recipientRegistry = await RecipientRegistry.deploy();
  await recipientRegistry.waitForDeployment();
  const recipientRegistryAddress = await recipientRegistry.getAddress();
  console.log("✓ RecipientRegistry deployed to:", recipientRegistryAddress);

  // 2. Deploy PaySurePayments pointing to tUSD8
  console.log("\n2. Deploying PaySurePayments (SafeERC20 tUSD8 Settlement)...");
  const PaySurePayments = await ethers.getContractFactory("PaySurePayments");
  const paySurePayments = await PaySurePayments.deploy(TUSD8_ADDRESS);
  await paySurePayments.waitForDeployment();
  const paySurePaymentsAddress = await paySurePayments.getAddress();
  console.log("✓ PaySurePayments deployed to:", paySurePaymentsAddress);

  console.log("\n====================================================");
  console.log("DEPLOYMENT COMPLETE!");
  console.log("====================================================");
  console.log(`NEXT_PUBLIC_RECIPIENT_REGISTRY_ADDRESS="${recipientRegistryAddress}"`);
  console.log(`NEXT_PUBLIC_PAYSURE_PAYMENTS_ADDRESS="${paySurePaymentsAddress}"`);
  console.log("Update these values in your .env file.");
  console.log("====================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });

