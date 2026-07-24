import { NextResponse } from "next/server";
import { checkPassword, sessionToken, DASHBOARD_COOKIE } from "../../../src/lib/dashboard-auth";

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}));

  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, error: "wrong-password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(DASHBOARD_COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(DASHBOARD_COOKIE);
  return res;
}
