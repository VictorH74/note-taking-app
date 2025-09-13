import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifySession } from "./lib/configs/firebase-admin";

const protectedRoutes = ["/pages"];
const loginUrl = "auth/login";

export default async function middleware(req: NextRequest) {
  const recoveredSession = (await cookies()).get("session")?.value;

  const verified = recoveredSession
    ? await verifySession(recoveredSession)
    : false;

  //   redirect if authenticated user go to login page
  if (verified && req.nextUrl.pathname.includes(loginUrl)) {
    return Response.redirect(new URL(protectedRoutes[0], req.url));
  }

  // redirect to login page if used go to protected page
  if (
    !verified &&
    protectedRoutes.some(
      (pathName) => req.url.includes(pathName) && !req.url.includes("/login")
    )
  ) {
    return Response.redirect(new URL(loginUrl, req.url));
  }
}

export const config = {
  matcher: ["/", "/pages", "/auth/login"],
  runtime: "nodejs",
};
