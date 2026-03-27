import crypto from 'crypto';

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Walletless persistence is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return { url, serviceRoleKey };
}

async function callSupabase(path, options = {}) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function deriveManagedFlowAddress(issuer) {
  const hash = crypto.createHash('sha256').update(issuer).digest('hex').slice(0, 16);
  return `0x${hash}`;
}

function normalizeMagicIssuer(issuer) {
  if (!issuer || typeof issuer !== 'string') {
    return null;
  }

  const normalized = issuer.trim();
  return normalized || null;
}

function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch (_) {
    return null;
  }
}

async function fetchMagicUserByDidToken(didToken) {
  const magicSecretKey = process.env.MAGIC_SECRET_KEY;

  if (!magicSecretKey || !didToken) {
    return null;
  }

  const endpoints = ['https://api.magic.link/v1/admin/auth/user/get', 'https://auth.magic.link/v1/admin/auth/user/get'];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Magic-Secret-Key': magicSecretKey,
        },
        body: JSON.stringify({ did_token: didToken }),
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const user = data?.data || data?.user || null;

      if (user?.issuer || user?.email) {
        return user;
      }
    } catch (_) {
      // Try next endpoint.
    }
  }

  return null;
}

export async function resolveMagicIdentity({
  didToken,
  fallbackIssuer,
  fallbackEmail,
}) {
  const userFromMagicApi = await fetchMagicUserByDidToken(didToken);
  if (userFromMagicApi) {
    return {
      issuer: normalizeMagicIssuer(userFromMagicApi.issuer),
      email: userFromMagicApi.email || fallbackEmail || null,
      tokenVerified: true,
    };
  }

  const jwtPayload = parseJwtPayload(didToken);
  const payloadIssuer = normalizeMagicIssuer(jwtPayload?.iss || jwtPayload?.sub);
  const issuer = payloadIssuer || normalizeMagicIssuer(fallbackIssuer);

  if (!issuer) {
    throw new Error('Unable to resolve Magic issuer from the current session.');
  }

  return {
    issuer,
    email: jwtPayload?.email || fallbackEmail || null,
    tokenVerified: false,
  };
}

export async function getWalletlessProfileByIssuer(issuer) {
  const normalizedIssuer = normalizeMagicIssuer(issuer);
  if (!normalizedIssuer) {
    return null;
  }

  const rows = await callSupabase(
    `walletless_profiles?magic_issuer=eq.${encodeURIComponent(normalizedIssuer)}&select=*`,
    { method: 'GET' }
  );

  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function upsertWalletlessProfile(profile) {
  const [row] = await callSupabase('walletless_profiles?on_conflict=magic_issuer', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([profile]),
  });

  return row;
}

export async function bootstrapWalletlessProfile({ issuer, email }) {
  const normalizedIssuer = normalizeMagicIssuer(issuer);

  if (!normalizedIssuer) {
    throw new Error('Magic issuer is required to bootstrap walletless profile.');
  }

  const existing = await getWalletlessProfileByIssuer(normalizedIssuer);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const managedAddress = deriveManagedFlowAddress(normalizedIssuer);

  return upsertWalletlessProfile({
    magic_issuer: normalizedIssuer,
    email: email || null,
    managed_flow_address: managedAddress,
    linked_flow_address: null,
    auth_mode: 'magic_walletless',
    signing_preference: 'sponsored',
    created_at: now,
    updated_at: now,
  });
}

export function toWalletlessProfileResponse(profile, tokenVerified = false) {
  if (!profile) {
    return null;
  }

  return {
    magicIssuer: profile.magic_issuer,
    email: profile.email,
    managedFlowAddress: profile.managed_flow_address,
    linkedFlowAddress: profile.linked_flow_address,
    signingPreference: profile.signing_preference || 'sponsored',
    authMode: profile.auth_mode || 'magic_walletless',
    tokenVerified,
  };
}
