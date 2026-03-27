import { getMagicIdToken } from '@/lib/auth/magic';

async function requestWalletlessAPI(url, options = {}) {
  const idToken = await getMagicIdToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
      ...(options.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'Walletless request failed');
  }

  return body;
}

export async function bootstrapWalletlessSession({ issuer, email }) {
  const result = await requestWalletlessAPI('/api/walletless/bootstrap', {
    method: 'POST',
    body: JSON.stringify({ issuer, email }),
  });

  return result.profile;
}

export async function fetchWalletlessProfile({ issuer, email }) {
  const params = new URLSearchParams();
  if (issuer) {
    params.set('issuer', issuer);
  }
  if (email) {
    params.set('email', email);
  }

  const query = params.toString();
  const path = query ? `/api/walletless/profile?${query}` : '/api/walletless/profile';

  const result = await requestWalletlessAPI(path, { method: 'GET' });
  return result.profile;
}
