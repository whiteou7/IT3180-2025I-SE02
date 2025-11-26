import { NextResponse } from "next/server"

export function middleware(request) {
  const { method, nextUrl } = request

  return NextResponse.next()
}
