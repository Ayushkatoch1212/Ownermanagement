import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pgs/:path*",
    "/rooms/:path*",
    "/students/:path*",
    "/payments/:path*",
    "/billing/:path*",
    "/expenses/:path*",
    "/reports/:path*",
    "/reminders/:path*",
    "/settings/:path*",
  ],
};