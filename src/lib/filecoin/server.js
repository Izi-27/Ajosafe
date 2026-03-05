const DEFAULT_FILECOIN_RPC_URL = 'https://api.calibration.node.glif.io/rpc/v1';

function getSynapseConfig() {
  const privateKey = process.env.FILECOIN_SYNAPSE_PRIVATE_KEY;
  const rpcURL = process.env.FILECOIN_RPC_URL || DEFAULT_FILECOIN_RPC_URL;

  if (!privateKey) {
    throw new Error('FILECOIN_SYNAPSE_PRIVATE_KEY is not configured');
  }

  return { privateKey, rpcURL };
}

async function createSynapseClient() {
  const { Synapse } = await import('@filoz/synapse-sdk');
  const { privateKey, rpcURL } = getSynapseConfig();

  return Synapse.create({
    privateKey,
    rpcURL,
  });
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
  const synapse = await createSynapseClient();
  const body = JSON.stringify({
    type,
    uploadedAt: new Date().toISOString(),
    payload,
  });

  const bytes = new TextEncoder().encode(body);
  const result = await synapse.storage.upload(bytes);
  const normalized = normalizeUploadResult(result);

  if (!normalized.pieceCid) {
    throw new Error('Synapse upload did not return a piece CID');
  }

  return normalized;
}

export async function downloadJSONPayloadFromFilecoin(pieceCid) {
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
}
