import { JsonRpcProvider } from "ethers";

async function isHardhatNodeRunning() {
  try {
    const provider = new JsonRpcProvider("http://localhost:8545");
    await provider.getBlockNumber();
    provider.destroy();
    return true;
  } catch {
    return false;
  }
}

isHardhatNodeRunning()
  .then((running) => {
    if (!running) {
      console.log("Hardhat node is not running. Please start it first.");
      process.exit(1);
    }
  })
  .catch(() => {
    process.exit(1);
  });

