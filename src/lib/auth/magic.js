let magicInstance = null;

function getPublishableKey() {
  return process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
}

function normalizeMagicInfo(info, fallbackEmail) {
  if (!info) {
    return null;
  }

  const publicAddress = info.publicAddress || null;

  return {
    email: info.email || fallbackEmail || null,
    issuer: info.issuer || null,
    publicAddress,
    addr: publicAddress,
    loggedIn: true,
  };
}

export async function getMagicClient() {
  if (typeof window === 'undefined') {
    return null;
  }

  const publishableKey = getPublishableKey();

  if (!publishableKey) {
    throw new Error(
      'NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY is not configured. Add it to your environment variables before using Magic Link login.'
    );
  }

  if (!magicInstance) {
    const { Magic } = await import('magic-sdk');
    magicInstance = new Magic(publishableKey);
  }

  return magicInstance;
}

export async function loginWithMagicLink(email) {
  const magic = await getMagicClient();
  await magic.auth.loginWithEmailOTP({ email, showUI: true });

  let info = null;
  if (typeof magic.user.getInfo === 'function') {
    info = await magic.user.getInfo();
  } else if (typeof magic.user.getMetadata === 'function') {
    info = await magic.user.getMetadata();
  }

  return normalizeMagicInfo(info, email);
}

export async function getMagicSession() {
  const magic = await getMagicClient();

  const isLoggedIn = await magic.user.isLoggedIn();
  if (!isLoggedIn) {
    return null;
  }

  let info = null;
  if (typeof magic.user.getInfo === 'function') {
    info = await magic.user.getInfo();
  } else if (typeof magic.user.getMetadata === 'function') {
    info = await magic.user.getMetadata();
  }

  return normalizeMagicInfo(info, null);
}

export async function getMagicIdToken() {
  const magic = await getMagicClient();
  return magic.user.getIdToken();
}

export async function logoutMagicSession() {
  const magic = await getMagicClient();
  const isLoggedIn = await magic.user.isLoggedIn();

  if (isLoggedIn) {
    await magic.user.logout();
  }
}
