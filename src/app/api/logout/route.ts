import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export default async function GET() {
  (await cookies()).delete("session");

  return NextResponse.json({ status: "success" });
}
