import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "ClaimEvaluator";

// <root>/../backend
const rel = "../backend";

// <root>/abi
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const dir = path.resolve(rel);
const dirname = path.basename(dir);

const line =
  "\n===================================================================\n";

if (!fs.existsSync(dir)) {
  console.error(
    `${line}Unable to locate ${rel}. Expecting <root>/../${dirname}${line}`
  );
  process.exit(1);
}

if (!fs.existsSync(outdir)) {
  console.error(`${line}Unable to locate ${outdir}.${line}`);
  process.exit(1);
}

// Read ABI directly from artifacts (no deployment needed)
const artifactsPath = path.join(dir, "artifacts", "contracts", `${CONTRACT_NAME}.sol`, `${CONTRACT_NAME}.json`);
if (!fs.existsSync(artifactsPath)) {
  console.error(
    `${line}Unable to locate '${artifactsPath}'.\n\nPlease compile the contracts first:\n1. Goto '${dirname}' directory\n2. Run 'npm run compile'${line}`
  );
  process.exit(1);
}

const artifactContent = fs.readFileSync(artifactsPath, "utf-8");
const artifact = JSON.parse(artifactContent);
const contractABI = artifact.abi;

if (!contractABI) {
  console.error(
    `${line}No ABI found in artifact file '${artifactsPath}'.${line}`
  );
  process.exit(1);
}

// Read deployment addresses (if they exist)
const deploymentsDir = path.join(dir, "deployments");

function readDeploymentAddress(chainName, chainId) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);
  const contractJsonPath = path.join(chainDeploymentDir, `${CONTRACT_NAME}.json`);

  if (!fs.existsSync(contractJsonPath)) {
    return null;
  }

  try {
    const jsonString = fs.readFileSync(contractJsonPath, "utf-8");
    const deployment = JSON.parse(jsonString);
    return {
      address: deployment.address,
      chainId: chainId,
      chainName: chainName
    };
  } catch (e) {
    console.warn(`Warning: Failed to read deployment file ${contractJsonPath}: ${e.message}`);
    return null;
  }
}

// Read deployment addresses (optional - skip if not deployed)
const deployLocalhost = readDeploymentAddress("localhost", 31337);
const deploySepolia = readDeploymentAddress("sepolia", 11155111);

// Collect all available deployments
const deployments = {
  "31337": deployLocalhost,
  "11155111": deploySepolia
};

// Generate ABI file
const tsCode = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
  Generated from: ${artifactsPath}
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify({ abi: contractABI }, null, 2)} as const;
\n`;

// Generate addresses object with only available deployments
const addressesEntries = [];
if (deployments["31337"]) {
  addressesEntries.push(`  "31337": { address: "${deployments["31337"].address}", chainId: 31337, chainName: "hardhat" }`);
}
if (deployments["11155111"]) {
  addressesEntries.push(`  "11155111": { address: "${deployments["11155111"].address}", chainId: 11155111, chainName: "sepolia" }`);
}

// If no deployments found, create empty addresses object
const addressesContent = addressesEntries.length > 0 
  ? addressesEntries.join(",\n")
  : `  // No deployments found. Deploy contracts to generate addresses.`;

const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
  Generated from: ${deploymentsDir}
*/
export const ${CONTRACT_NAME}Addresses = { 
${addressesContent}
};
`;

// Write files
const abiFilePath = path.join(outdir, `${CONTRACT_NAME}ABI.ts`);
const addressesFilePath = path.join(outdir, `${CONTRACT_NAME}Addresses.ts`);

fs.writeFileSync(abiFilePath, tsCode, "utf-8");
fs.writeFileSync(addressesFilePath, tsAddresses, "utf-8");

console.log(`✓ Generated ${abiFilePath}`);
console.log(`✓ Generated ${addressesFilePath}`);

if (addressesEntries.length === 0) {
  console.log(`\n⚠ Warning: No deployment addresses found. Deploy contracts to generate addresses.`);
} else {
  console.log(`\n✓ Found ${addressesEntries.length} deployment(s):`);
  if (deployments["31337"]) {
    console.log(`  - localhost (31337): ${deployments["31337"].address}`);
  }
  if (deployments["11155111"]) {
    console.log(`  - sepolia (11155111): ${deployments["11155111"].address}`);
  }
}

