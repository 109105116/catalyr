import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req });

  if (pathname === "/p") {
    return NextResponse.redirect(new URL("/home", req.nextUrl));
  }
  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/info", req.nextUrl));
    }
    if (token) {
      return NextResponse.redirect(new URL("/home", req.nextUrl));
    }
  }
  if (token) {
    if (pathname === "/sign-in" || pathname === "/sign-up") {
      return NextResponse.redirect(new URL("/home", req.nextUrl));
    }
  }
}
export const config = {
  matcher: "/((?!api|_next|static|public).*)",
};
