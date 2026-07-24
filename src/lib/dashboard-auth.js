import crypto from "crypto";

export const DASHBOARD_COOKIE = "sm_dash_session";

function sessionToken() {
  return crypto
    .createHmac("sha256", process.env.SESSION_SECRET || "")
    .update("authenticated")
    .digest("hex");
}

export function checkPassword(password) {
  const expected = Buffer.from(process.env.DASHBOARD_PASSWORD || "");
  const given = Buffer.from(password || "");
  if (expected.length === 0 || expected.length !== given.length) return false;
  return crypto.timingSafeEqual(expected, given);
}

export function isValidSession(cookieValue) {
  if (!cookieValue) return false;
  const expected = Buffer.from(sessionToken());
  const given = Buffer.from(cookieValue);
  if (given.length !== expected.length) return false;
  return crypto.timingSafeEqual(given, expected);
}

export { sessionToken };
