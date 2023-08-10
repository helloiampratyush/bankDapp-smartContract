const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log("going to deploy..........");
  const bankV2 = await deploy("bankdppv2", {
    from: deployer,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  const chainId = network.config.chainId;
  if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
    await verify(bankV2.address, []);
    console.log("verification done");
  }
};
module.exports.tags = ["all", "bankdppV2"];
