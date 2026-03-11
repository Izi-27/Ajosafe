const DEFAULT_FILECOIN_RPC_URL = 'https://api.calibration.node.glif.io/rpc/v1';
const FILECOIN_UPLOAD_RETRIES = 3;
const FILECOIN_RETRY_DELAY_MS = 1500;

function normalizePrivateKey(privateKey) {
  if (!privateKey) {
    return privateKey;
  }

  return privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
}

function getFilecoinErrorMessage(error, fallback) {
  return (
    error?.shortMessage ||
    error?.details ||
    error?.cause?.message ||
    error?.message ||
    fallback
  );
}

function shouldRetryFilecoinUpload(error) {
  const message = getFilecoinErrorMessage(error, '').toLowerCase();

  return (
    message.includes('failed to commit on primary provider') ||
    message.includes('data is stored but not on-chain') ||
    message.includes('provider') ||
    message.includes('timeout') ||
    message.includes('temporar')
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSynapseConfig() {
  const privateKey = normalizePrivateKey(process.env.FILECOIN_SYNAPSE_PRIVATE_KEY);
  const rpcURL = process.env.FILECOIN_RPC_URL || DEFAULT_FILECOIN_RPC_URL;

  if (!privateKey) {
    throw new Error(
      'Filecoin storage is not configured. Set FILECOIN_SYNAPSE_PRIVATE_KEY and FILECOIN_RPC_URL in your deployment environment.'
    );
  }

  return { privateKey, rpcURL };
}

async function createSynapseClient() {
  const { Synapse } = await import('@filoz/synapse-sdk');
  const { privateKeyToAccount } = await import('viem/accounts');
  const { privateKey, rpcURL } = getSynapseConfig();

  return Synapse.create({
    account: privateKeyToAccount(privateKey),
    rpcURL,
    source: 'ajosafe',
  });
}

async function ensureStoragePreparation(synapse, dataSize) {
  if (!synapse?.storage || typeof synapse.storage.prepare !== 'function') {
    throw new Error(
      'Synapse SDK version does not support storage.prepare(). Upgrade @filoz/synapse-sdk to the current docs-compatible release before uploading.'
    );
  }

  const preparation = await synapse.storage.prepare({
    dataSize: BigInt(dataSize),
  });

  if (preparation?.transaction) {
    await preparation.transaction.execute();
  }

  return preparation;
}

function normalizeUploadResult(result) {
  if (typeof result === 'string') {
    return {
      pieceCid: result,
      payloadCid: null,
    };
  }

  return {
    pieceCid: result?.pieceCid || result?.pieceCID || result?.piece_cid || null,
    payloadCid: result?.payloadCid || result?.payloadCID || result?.payload_cid || null,
  };
}

export async function uploadJSONPayloadToFilecoin(type, payload) {
  let lastError = null;

  for (let attempt = 1; attempt <= FILECOIN_UPLOAD_RETRIES; attempt += 1) {
    try {
      const synapse = await createSynapseClient();
      const body = JSON.stringify({
        type,
        uploadedAt: new Date().toISOString(),
        payload,
      });

      const bytes = new TextEncoder().encode(body);
      await ensureStoragePreparation(synapse, bytes.byteLength);
      const result = await synapse.storage.upload(bytes);
      const normalized = normalizeUploadResult(result);

      if (!normalized.pieceCid) {
        throw new Error('Synapse upload did not return a piece CID.');
      }

      return normalized;
    } catch (error) {
      lastError = error;

      const shouldRetry =
        attempt < FILECOIN_UPLOAD_RETRIES && shouldRetryFilecoinUpload(error);

      if (!shouldRetry) {
        break;
      }

      await sleep(FILECOIN_RETRY_DELAY_MS * attempt);
    }
  }

  throw new Error(getFilecoinErrorMessage(lastError, 'Filecoin upload failed'));
}

export async function downloadJSONPayloadFromFilecoin(pieceCid) {
  try {
    const synapse = await createSynapseClient();
    const bytes = await synapse.storage.download(pieceCid);
    const text = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(text);

    return {
      pieceCid,
      payload: parsed.payload,
      type: parsed.type,
      uploadedAt: parsed.uploadedAt,
    };
  } catch (error) {
    throw new Error(getFilecoinErrorMessage(error, 'Filecoin download failed'));
  }
}
