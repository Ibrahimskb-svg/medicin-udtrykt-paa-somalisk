import crypto from "crypto";

export const DASHBOARD_COOKIE = "sm_dash_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 dage, matcher cookiens maxAge

// Tokenet er "expiresAt.hmac(expiresAt)" i stedet for en fast streng, så et
// lækket token ikke er gyldigt for evigt — det udløber reelt server-side,
// ikke kun via cookiens klient-styrede maxAge (som en replayet request kan ignorere).
function sign(expiresAt) {
  return crypto
    .createHmac("sha256", process.env.SESSION_SECRET || "")
    .update(String(expiresAt))
    .digest("hex");
}

function sessionToken() {
  const expiresAt = Date.now() + SESSION_MAX_AGE_MS;
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function checkPassword(password) {
  const expected = Buffer.from(process.env.DASHBOARD_PASSWORD || "");
  const given = Buffer.from(password || "");
  if (expected.length === 0 || expected.length !== given.length) return false;
  return crypto.timingSafeEqual(expected, given);
}

export function isValidSession(cookieValue) {
  if (!cookieValue) return false;
  const [expiresAtStr, mac] = cookieValue.split(".");
  const expiresAt = Number(expiresAtStr);
  if (!expiresAtStr || !mac || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expected = Buffer.from(sign(expiresAt));
  const given = Buffer.from(mac);
  if (given.length !== expected.length) return false;
  return crypto.timingSafeEqual(given, expected);
}

export { sessionToken };
