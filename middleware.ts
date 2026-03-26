import NextAuth from "next-auth";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  publicRoutes,
  authRoutes,
} from "@/routes";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  // Allow all /api/* routes (except the auth redirects) to pass through without
  // redirecting to the sign-in page. This is critical for /api/chat to work
  // even when the user's session token is missing or expired.
  const isApiRoute = nextUrl.pathname.startsWith("/api/");

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute || isApiRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/sign-in", nextUrl));
  }

  return null;
});
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - Static files (.svg, .ico, .png, .jpg, etc.)
     * - _next internals
     * - /icon (Next.js generated favicon)
     * - /favicon.ico
     */
    "/((?!_next|icon|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};