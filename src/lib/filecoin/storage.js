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

  return null;
}

export async function storeAgreementOnFilecoin(agreementData) {
  const createdAt = new Date().toISOString();
  const agreement = {
    circleName: agreementData.name,
    description: agreementData.description || '',
    createdAt,
    members: agreementData.members,
    rules: {
      contributionAmount: agreementData.contributionAmount,
      frequency: agreementData.frequency,
      frequencySeconds: agreementData.frequencySeconds || null,
      totalRounds: agreementData.totalRounds,
      penaltyRate: agreementData.penaltyRate,
      maxMissesBeforeExpulsion: agreementData.maxMissesBeforeExpulsion || 3,
      payoutOrder: agreementData.payoutOrder,
    },
    lifecycle: {
      status: 'pending_acknowledgement',
      createdAt,
      activationDate: null,
      acknowledgementRequirement: 'all_members',
    },
    paymentSchedule: {
      firstDueDate: null,
      roundDueDates: [],
      activationRule: 'all_members_must_acknowledge_before_activation',
    },
    acknowledgements: agreementData.members.map((member) => ({
      address: member.address,
      name: member.name,
      status: member.address === agreementData.creatorAddress ? 'acknowledged' : 'pending',
    })),
    terms: agreementData.termsText || 'Standard AjoSafe terms and conditions apply.',
    signatures: [],
  };

  const result = await postJSON('/api/filecoin/upload', {
    type: 'agreement',
    payload: agreement,
  });

  return {
    cid: normalizeCid(result.pieceCid),
    pieceCid: normalizeCid(result.pieceCid),
    payloadCid: normalizeCid(result.payloadCid),
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

  return normalizeCid(result.pieceCid);
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
    cid: normalizeCid(result.pieceCid),
    pieceCid: normalizeCid(result.pieceCid),
    payloadCid: normalizeCid(result.payloadCid),
  };
}
