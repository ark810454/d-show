import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicPaths = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("dshow_access_token")?.value;
  const companyId = request.cookies.get("dshow_company_id")?.value;
  const activityId = request.cookies.get("dshow_activity_id")?.value;

  if (!token && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL(companyId ? "/select-activity" : "/select-company", request.url));
  }

  if (token && pathname.startsWith("/dashboard") && !companyId) {
    return NextResponse.redirect(new URL("/select-company", request.url));
  }

  if (token && pathname.startsWith("/dashboard") && companyId && !activityId) {
    return NextResponse.redirect(new URL("/select-activity", request.url));
  }

  if (token && pathname.startsWith("/users") && !companyId) {
    return NextResponse.redirect(new URL("/select-company", request.url));
  }

  if (token && pathname.startsWith("/users") && companyId && !activityId) {
    return NextResponse.redirect(new URL("/select-activity", request.url));
  }

  if (token && pathname.startsWith("/profile") && !companyId) {
    return NextResponse.redirect(new URL("/select-company", request.url));
  }

  if (token && pathname === "/select-activity" && !companyId) {
    return NextResponse.redirect(new URL("/select-company", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
