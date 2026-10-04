import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

let ethers;
try {
  ethers = require('ethers');
} catch {
  ethers = require(path.resolve(__dirname, '../../backend/node_modules/ethers'));
}

async function main() {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:7545';
  console.log(`[Deploy] Connecting to EVM RPC at ${rpcUrl}...`);

  const artifactPath = path.resolve(__dirname, '../build/contracts/BridgeDonation.json');
  if (!fs.existsSync(artifactPath)) {
    console.error('[Deploy Error] Artifact not found. Run "node blockchain/scripts/compile.js" first.');
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  try {
    const network = await provider.getNetwork();
    console.log(`[Deploy] Connected to network: chainId ${network.chainId}`);

    let signer;
    if (process.env.BLOCKCHAIN_PRIVATE_KEY) {
      signer = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);
    } else {
      signer = await provider.getSigner(0);
    }

    const signerAddress = await signer.getAddress();
    console.log(`[Deploy] Deployer account: ${signerAddress}`);

    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    console.log('[Deploy] Deploying BridgeDonation contract...');
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const deployedAddress = await contract.getAddress();
    console.log(`✅ BridgeDonation successfully deployed at: ${deployedAddress}`);

    // Update artifact with deployed address
    artifact.networks = artifact.networks || {};
    artifact.networks[network.chainId.toString()] = {
      address: deployedAddress,
      transactionHash: contract.deploymentTransaction()?.hash,
    };
    fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2), 'utf8');

    // Also update backend artifact
    const backendArtifactPath = path.resolve(__dirname, '../../backend/src/config/contracts/BridgeDonation.json');
    if (fs.existsSync(backendArtifactPath)) {
      const backendArtifact = JSON.parse(fs.readFileSync(backendArtifactPath, 'utf8'));
      backendArtifact.networks = artifact.networks;
      backendArtifact.address = deployedAddress;
      fs.writeFileSync(backendArtifactPath, JSON.stringify(backendArtifact, null, 2), 'utf8');
    }

    console.log('[Deploy] Saved deployed address to contract artifacts.');
    return deployedAddress;
  } catch (err) {
    console.error('[Deploy Error]', err.message);
    console.log('[Deploy Notice] If Ganache is offline, start Ganache on port 7545.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
