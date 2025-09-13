"use server";
import { authAdmin } from "@/lib/configs/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { idToken /*csrfToken*/ } = await req.json();

  // TODO: Guard against CSRF attacks.
  // if (csrfToken !== req.cookies.csrfToken) {
  //   res.status(401).send("UNAUTHORIZED REQUEST!");
  //   return;
  // }

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    const sessionCookie = await authAdmin.createSessionCookie(idToken, {
      expiresIn,
    });

    const options = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };

    (await cookies()).set("session", sessionCookie, options);

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error creating session cookie:", error);
    return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  }
}
