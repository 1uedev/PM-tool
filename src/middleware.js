export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/projects/:path*",
    "/api/projects/:path*",
  ],
};
