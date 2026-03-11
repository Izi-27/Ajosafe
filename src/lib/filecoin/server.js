const DEFAULT_FILECOIN_RPC_URL = 'https://api.calibration.node.glif.io/rpc/v1';

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

function normalizeCid(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && typeof value['/'] === 'string') {
    return value['/'];
  }

  if (typeof value?.toString === 'function') {
    const normalized = value.toString();
    if (typeof normalized === 'string' && /^(baf|Qm)/.test(normalized)) {
      return normalized;
    }
  }

  return null;
}

function extractCidFromRetrievalUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url);
    const candidate = parsed.pathname.split('/').filter(Boolean).pop();
    return candidate && /^(baf|Qm)/.test(candidate) ? candidate : null;
  } catch (_) {
    return null;
  }
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
  });
}

async function ensureStoragePreparation(synapse, dataSize) {
  if (!synapse?.storage || typeof synapse.storage.prepare !== 'function') {
    throw new Error(
      'Synapse SDK version does not support storage.prepare(). Ensure @filoz/synapse-sdk v0.39.0 or newer is installed in the deployment before uploading.'
    );
  }

  const preparation = await synapse.storage.prepare({
    dataSize: BigInt(dataSize),
  });

  if (preparation?.transaction) {
    const execution = await preparation.transaction.execute();

    if (execution && typeof execution.wait === 'function') {
      await execution.wait();
    } else if (typeof preparation.transaction.wait === 'function') {
      await preparation.transaction.wait();
    }
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

  const pieceCid =
    normalizeCid(result?.pieceCid || result?.pieceCID || result?.piece_cid) ||
    normalizeCid(result?.cid) ||
    normalizeCid(result?.piece) ||
    normalizeCid(result?.data?.pieceCid || result?.data?.pieceCID || result?.data?.piece_cid) ||
    normalizeCid(result?.result?.pieceCid || result?.result?.pieceCID || result?.result?.piece_cid) ||
    extractCidFromRetrievalUrl(result?.copies?.[0]?.retrievalUrl);

  const payloadCid =
    normalizeCid(result?.payloadCid || result?.payloadCID || result?.payload_cid) ||
    normalizeCid(result?.data?.payloadCid || result?.data?.payloadCID || result?.data?.payload_cid) ||
    normalizeCid(result?.result?.payloadCid || result?.result?.payloadCID || result?.result?.payload_cid);

  return {
    pieceCid,
    payloadCid,
  };
}

export async function uploadJSONPayloadToFilecoin(type, payload) {
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
      const keys = result && typeof result === 'object' ? Object.keys(result).join(', ') : typeof result;
      throw new Error(`Synapse upload returned an unexpected result shape. Keys: ${keys || 'none'}`);
    }

    return normalized;
  } catch (error) {
    throw new Error(getFilecoinErrorMessage(error, 'Filecoin upload failed'));
  }
}

export async function downloadJSONPayloadFromFilecoin(pieceCid) {
  try {
    const synapse = await createSynapseClient();
    const normalizedPieceCid = normalizeCid(pieceCid);

    if (!normalizedPieceCid) {
      throw new Error('A valid agreement piece CID is required to retrieve Filecoin records.');
    }

    const bytes = await synapse.storage.download({ pieceCid: normalizedPieceCid });
    const text = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(text);

    return {
      pieceCid: normalizedPieceCid,
      payload: parsed.payload,
      type: parsed.type,
      uploadedAt: parsed.uploadedAt,
    };
  } catch (error) {
    throw new Error(getFilecoinErrorMessage(error, 'Filecoin download failed'));
  }
}
