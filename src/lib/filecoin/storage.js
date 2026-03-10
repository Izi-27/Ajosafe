async function postJSON(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = 'Filecoin request failed';

    try {
      const error = await response.json();
      message = error.error || message;
    } catch (_) {
      // Ignore JSON parsing issues and use the default message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function storeAgreementOnFilecoin(agreementData) {
  const agreement = {
    circleName: agreementData.name,
    description: agreementData.description || '',
    createdAt: new Date().toISOString(),
    members: agreementData.members,
    rules: {
      contributionAmount: agreementData.contributionAmount,
      frequency: agreementData.frequency,
      totalRounds: agreementData.totalRounds,
      penaltyRate: agreementData.penaltyRate,
      maxMissesBeforeExpulsion: agreementData.maxMissesBeforeExpulsion || 3,
      payoutOrder: agreementData.payoutOrder,
    },
    terms: agreementData.termsText || 'Standard AjoSafe terms and conditions apply.',
    signatures: [],
  };

  const result = await postJSON('/api/filecoin/upload', {
    type: 'agreement',
    payload: agreement,
  });

  return {
    cid: result.pieceCid,
    pieceCid: result.pieceCid,
    payloadCid: result.payloadCid || null,
  };
}

export async function getAgreementFromFilecoin(pieceCid) {
  const response = await fetch(`/api/filecoin/${encodeURIComponent(pieceCid)}`);

  if (!response.ok) {
    let message = 'Failed to retrieve agreement from Filecoin';

    try {
      const error = await response.json();
      message = error.error || message;
    } catch (_) {
      // Ignore JSON parsing issues and use the default message.
    }

    throw new Error(message);
  }

  const result = await response.json();
  return result.payload;
}

export async function createAgreementAcknowledgement({
  circleId,
  agreementCid,
  memberAddress,
  memberName,
  role = 'member',
  acknowledgement,
}) {
  const acknowledgementData = {
    circleId,
    agreementCid,
    memberAddress,
    memberName: memberName || null,
    role,
    acknowledgement:
      acknowledgement || 'I acknowledge the AjoSafe agreement and confirm participation in this circle.',
    timestamp: new Date().toISOString(),
  };

  const result = await postJSON('/api/filecoin/upload', {
    type: 'agreement-acknowledgement',
    payload: acknowledgementData,
  });

  return result.pieceCid;
}

export async function uploadFileRecordToFilecoin(file) {
  const text = await file.text();
  const result = await postJSON('/api/filecoin/upload', {
    type: 'file',
    payload: {
      name: file.name,
      contentType: file.type || 'text/plain',
      body: text,
    },
  });

  return {
    cid: result.pieceCid,
    pieceCid: result.pieceCid,
    payloadCid: result.payloadCid || null,
  };
}
