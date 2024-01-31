import { withAuth } from "next-auth/middleware";

// middleware is applied to all routes, use conditionals to select

export default withAuth(
  function middleware() {
    /* noop */
  },
  {
    pages: {
      signIn: "/auth/signin",
    },
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname.startsWith("/dashboard") && token === null) {
          return false;
        }
        return true;
      },
    },
  },
);
