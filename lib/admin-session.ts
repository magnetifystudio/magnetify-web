const SESSION_COOKIE_NAME = "magnetify_admin_session";
// FIX: 7 din → 8 ghante
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const DEFAULT_ADMIN_EMAIL = "magnetifystudio@outlook.com";
const DEFAULT_ADMIN_PASSWORD = "Magnetify!2#";

type AdminSessionPayload = {
  email: string;
  exp: number;
};

function bytesToBase64(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function base64ToBytes(base64: string) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function getRequiredSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "magnetify-studio-dev-secret-change-me";
}

function getAdminEmail() {
  return process.env.ADMIN_LOGIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
}

function getAdminPassword() {
  return process.env.ADMIN_LOGIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
}

function encodeBase64Url(value: string) {
  return bytesToBase64(new TextEncoder().encode(value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return new TextDecoder().decode(base64ToBytes(padded));
}

async function signValue(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getRequiredSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );

  return bytesToBase64(new Uint8Array(signature))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function getAdminSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function isAllowedAdmin(email: string, password: string) {
  return (
    email.trim().toLowerCase() === getAdminEmail().toLowerCase() &&
    password === getAdminPassword()
  );
}

export async function createAdminSessionToken(email: string) {
  const payload: AdminSessionPayload = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split(".");

  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = await signValue(encodedPayload);

  if (expectedSignature !== providedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(
      decodeBase64Url(encodedPayload),
    ) as AdminSessionPayload;

    if (
      payload.exp < Date.now() ||
      payload.email !== getAdminEmail().toLowerCase()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Cookie bhi 8 ghante mein expire hogi
    maxAge: SESSION_TTL_MS / 1000,
  };
}