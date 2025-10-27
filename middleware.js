import { NextResponse } from "next/server"

export function middleware(request) {
  const { method, nextUrl } = request

  // Only apply to API routes
  if (nextUrl.pathname.startsWith("/api") && method !== "GET" && process.env.PREVIEW_MODE == "true") {
    return NextResponse.json({ message: "Blocking all requests during preview" }, { status: 405 })
  }

  return NextResponse.next()
}
