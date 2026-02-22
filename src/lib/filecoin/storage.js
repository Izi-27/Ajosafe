import lighthouse from '@lighthouse-web3/sdk';

const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY;

export async function storeAgreementOnFilecoin(agreementData) {
  const agreement = {
    circleName: agreementData.name,
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

  const agreementJSON = JSON.stringify(agreement, null, 2);
  const blob = new Blob([agreementJSON], { type: 'application/json' });
  const file = new File([blob], `agreement-${Date.now()}.json`);

  try {
    const uploadResponse = await lighthouse.upload(file, LIGHTHOUSE_API_KEY);
    const cid = uploadResponse.data.Hash;

    return {
      cid,
      url: `https://gateway.lighthouse.storage/ipfs/${cid}`,
    };
  } catch (error) {
    console.error('Filecoin upload error:', error);
    throw new Error('Failed to store agreement on Filecoin');
  }
}

export async function getAgreementFromFilecoin(cid) {
  try {
    const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${cid}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Filecoin retrieval error:', error);
    throw new Error('Failed to retrieve agreement from Filecoin');
  }
}

export async function storeSignature(circleId, memberAddress, signature, agreementCid) {
  const signatureData = {
    circleId,
    memberAddress,
    signature,
    timestamp: new Date().toISOString(),
    agreementCid,
  };

  const blob = new Blob([JSON.stringify(signatureData)], { type: 'application/json' });
  const file = new File([blob], `signature-${circleId}-${memberAddress}.json`);

  try {
    const uploadResponse = await lighthouse.upload(file, LIGHTHOUSE_API_KEY);
    return uploadResponse.data.Hash;
  } catch (error) {
    console.error('Signature upload error:', error);
    throw new Error('Failed to store signature');
  }
}

export async function uploadToIPFS(file) {
  try {
    const uploadResponse = await lighthouse.upload(file, LIGHTHOUSE_API_KEY);
    return {
      cid: uploadResponse.data.Hash,
      url: `https://gateway.lighthouse.storage/ipfs/${uploadResponse.data.Hash}`,
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error('Failed to upload to IPFS');
  }
}
