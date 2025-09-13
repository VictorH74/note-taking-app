import { authAdmin } from "@/lib/configs/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { sessionCookie } = await req.json();

  try {
    await authAdmin.verifySessionCookie(sessionCookie!, true);
    return NextResponse.json({ verified: true }, { status: 200 });
  } catch {
    return NextResponse.json({ verified: false }, { status: 401 });
  }
}
