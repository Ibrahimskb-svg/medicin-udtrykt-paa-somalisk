import crypto from "crypto";

export const DASHBOARD_COOKIE = "sm_dash_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 dage, matcher cookiens maxAge

// Tokenet er "expiresAt.hmac(expiresAt)" i stedet for en fast streng, så et
// lækket token ikke er gyldigt for evigt — det udløber reelt server-side,
// ikke kun via cookiens klient-styrede maxAge (som en replayet request kan ignorere).
function sign(expiresAt) {
  const secret = process.env.SESSION_SECRET;
  // Fejler lukket (kaster), i stedet for at underskrive med en tom streng,
  // hvis SESSION_SECRET nogensinde skulle mangle i miljøet — en tom nøgle
  // er offentligt kendt (HMAC-SHA256("")) og ville gøre det muligt for
  // enhver selv at udregne et gyldigt sessions-token uden adgangskoden.
  if (!secret) throw new Error("SESSION_SECRET er ikke sat");
  return crypto.createHmac("sha256", secret).update(String(expiresAt)).digest("hex");
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
