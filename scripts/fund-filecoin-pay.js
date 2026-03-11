#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_RPC_URL = 'https://api.calibration.node.glif.io/rpc/v1';
const DEFAULT_DATA_SIZE_BYTES = 1024 * 1024;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, 'utf8');

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function loadLocalEnv() {
  const repoRoot = process.cwd();
  loadEnvFile(path.join(repoRoot, '.env'));
  loadEnvFile(path.join(repoRoot, '.env.local'));
}

function normalizePrivateKey(privateKey) {
  if (!privateKey) {
    return privateKey;
  }

  return privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
}

function parseArgs(argv) {
  const options = {
    dataSizeBytes: DEFAULT_DATA_SIZE_BYTES,
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--data-size-bytes') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('Missing value for --data-size-bytes');
      }

      options.dataSizeBytes = Number.parseInt(value, 10);
      index += 1;
      continue;
    }

    if (arg.startsWith('--data-size-bytes=')) {
      options.dataSizeBytes = Number.parseInt(arg.split('=')[1], 10);
      continue;
    }
  }

  if (!Number.isFinite(options.dataSizeBytes) || options.dataSizeBytes <= 0) {
    throw new Error('data-size-bytes must be a positive integer');
  }

  return options;
}

function stringifyWithBigInts(value) {
  return JSON.stringify(
    value,
    (_, currentValue) => (typeof currentValue === 'bigint' ? currentValue.toString() : currentValue),
    2
  );
}

function extractTransactionHash(execution) {
  return (
    execution?.hash ||
    execution?.transactionHash ||
    execution?.receipt?.transactionHash ||
    null
  );
}

async function waitForExecution(execution, preparation) {
  if (execution && typeof execution.wait === 'function') {
    await execution.wait();
    return;
  }

  if (preparation?.transaction && typeof preparation.transaction.wait === 'function') {
    await preparation.transaction.wait();
  }
}

async function main() {
  loadLocalEnv();

  const options = parseArgs(process.argv.slice(2));
  const privateKey = normalizePrivateKey(process.env.FILECOIN_SYNAPSE_PRIVATE_KEY);
  const rpcURL = process.env.FILECOIN_RPC_URL || DEFAULT_RPC_URL;

  if (!privateKey) {
    throw new Error('FILECOIN_SYNAPSE_PRIVATE_KEY is required in .env.local or the current shell.');
  }

  const { Synapse } = await import('@filoz/synapse-sdk');
  const { privateKeyToAccount } = await import('viem/accounts');

  const synapse = Synapse.create({
    account: privateKeyToAccount(privateKey),
    rpcURL,
  });

  if (!synapse?.storage || typeof synapse.storage.getUploadCosts !== 'function') {
    throw new Error('Installed Synapse SDK does not expose storage.getUploadCosts(). Confirm @filoz/synapse-sdk v0.39.0 is installed.');
  }

  if (typeof synapse.storage.prepare !== 'function') {
    throw new Error('Installed Synapse SDK does not expose storage.prepare(). Confirm @filoz/synapse-sdk v0.39.0 is installed.');
  }

  const dataSize = BigInt(options.dataSizeBytes);

  console.log(`Checking Synapse upload costs for ${options.dataSizeBytes} bytes...`);

  const costs = await synapse.storage.getUploadCosts({
    dataSize,
  });

  console.log('Upload cost summary:');
  console.log(stringifyWithBigInts(costs));

  console.log('Preparing Filecoin Pay funding and approval...');
  const preparation = await synapse.storage.prepare({
    dataSize,
  });

  console.log('Preparation response:');
  console.log(stringifyWithBigInts(preparation));

  if (!preparation?.transaction) {
    console.log('No funding transaction required. Filecoin Pay appears ready for this upload size.');
    return;
  }

  if (options.dryRun) {
    console.log('Dry run enabled. Preparation created a transaction, but it was not executed.');
    return;
  }

  console.log('Executing Filecoin Pay funding/approval transaction...');
  const execution = await preparation.transaction.execute();
  const hash = extractTransactionHash(execution);

  if (hash) {
    console.log(`Transaction submitted: ${hash}`);
  } else {
    console.log('Transaction submitted. Hash was not exposed by the SDK response.');
  }

  await waitForExecution(execution, preparation);

  console.log('Funding step completed. Re-run your create-circle flow after this succeeds.');
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
