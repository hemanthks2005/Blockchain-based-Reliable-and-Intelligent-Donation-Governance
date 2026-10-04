import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

let solc;
try {
  solc = require('solc');
} catch {
  solc = require(path.resolve(__dirname, '../../backend/node_modules/solc'));
}


const contractPath = path.resolve(__dirname, '../contracts/BridgeDonation.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'BridgeDonation.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode'],
      },
    },
  },
};

console.log('[Compiler] Compiling BridgeDonation.sol using solc v0.8.20...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasError = false;
  for (const err of output.errors) {
    if (err.severity === 'error') {
      hasError = true;
      console.error('[Compiler Error]', err.formattedMessage);
    } else {
      console.warn('[Compiler Warning]', err.formattedMessage);
    }
  }
  if (hasError) {
    process.exit(1);
  }
}

const contractObj = output.contracts['BridgeDonation.sol']['BridgeDonation'];
const artifact = {
  contractName: 'BridgeDonation',
  abi: contractObj.abi,
  bytecode: '0x' + contractObj.evm.bytecode.object,
  deployedBytecode: '0x' + contractObj.evm.deployedBytecode.object,
  compilerVersion: '0.8.20',
  updatedAt: new Date().toISOString(),
};

// Target destinations
const backendDest = path.resolve(__dirname, '../../backend/src/config/contracts/BridgeDonation.json');
const blockchainDest = path.resolve(__dirname, '../build/contracts/BridgeDonation.json');

fs.mkdirSync(path.dirname(backendDest), { recursive: true });
fs.mkdirSync(path.dirname(blockchainDest), { recursive: true });

fs.writeFileSync(backendDest, JSON.stringify(artifact, null, 2), 'utf8');
fs.writeFileSync(blockchainDest, JSON.stringify(artifact, null, 2), 'utf8');

console.log('✅ BridgeDonation compiled successfully!');
console.log('Artifacts generated at:');
console.log(' -', backendDest);
console.log(' -', blockchainDest);
