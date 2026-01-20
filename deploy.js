const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy Reward Token
  const FarmToken = await hre.ethers.getContractFactory("FarmToken");
  const farmToken = await FarmToken.deploy();
  await farmToken.waitForDeployment();
  console.log("FarmToken deployed to:", farmToken.target);

  // 2. Deploy Staking Vault (Using FarmToken as both staking and reward for simplicity)
  const StakingVault = await hre.ethers.getContractFactory("StakingVault");
  const vault = await StakingVault.deploy(farmToken.target, farmToken.target);
  await vault.waitForDeployment();
  console.log("StakingVault deployed to:", vault.target);

  // 3. Fund the Vault with rewards
  const fundAmount = hre.ethers.parseEther("10000");
  await farmToken.transfer(vault.target, fundAmount);
  console.log("Vault funded with rewards");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
