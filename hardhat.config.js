require("@nomicfoundation/hardhat-toolbox");
try {
  require("@next/env").loadEnvConfig(process.cwd());
} catch (e) {}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    aevum: {
      url: process.env.NEXT_PUBLIC_AEVUM_RPC_URL || "https://rpc-test.qday.info",
      chainId: 44005,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};
