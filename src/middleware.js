import { withAuth } from "next-auth/middleware";

// Security headers are set globally via headers() in next.config.mjs —
// this middleware only enforces authentication on protected paths.
export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

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
