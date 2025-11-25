import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedClaimEvaluator = await deploy("ClaimEvaluator", {
    from: deployer,
    log: true,
  });

  console.log(`ClaimEvaluator contract: `, deployedClaimEvaluator.address);
};
export default func;
func.id = "deploy_claimEvaluator"; // id required to prevent reexecution
func.tags = ["ClaimEvaluator"];

