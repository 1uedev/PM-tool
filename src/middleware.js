import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

function addSecurityHeaders(response) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // HSTS — only effective over HTTPS; harmless over HTTP in dev
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  return response;
}

export default withAuth(
  function middleware(req) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/projects/:path*",
    "/api/projects/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/users/:path*",
    "/api/notifications/:path*",
    "/api/templates/:path*",
  ],
};
