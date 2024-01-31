import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./googleAuth/session";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const session = await getSession();
  if (session === undefined) {
    const sourceUrl = new URL(request.url);
    const url = new URL("/login", sourceUrl.origin);
    url.searchParams.set("redirect", sourceUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (homepage)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|logout).*)",
  ],
};
