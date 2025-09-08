import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const protectedRoutes = ["/pages"];
const loginUrl = "auth/login";

export default async function middleware(req: NextRequest) {
  const recoveredToken = (await cookies()).get("session")?.value;

  //   redirect if authenticated user go to login page
  if (!!recoveredToken && req.nextUrl.pathname.includes(loginUrl)) {
    return Response.redirect(new URL(protectedRoutes[0], req.url));
  }

  // redirect to login page if used go to protected page
  if (
    !recoveredToken &&
    protectedRoutes.some(
      (pathName) => req.url.includes(pathName) && !req.url.includes("/login")
    )
  ) {
    return Response.redirect(new URL(loginUrl, req.url));
  }
}

export const config = {
  matcher: ["/", "/auth/login"],
};
