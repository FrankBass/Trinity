import type { NextRequest, NextResponse } from "next/server"
import { NextResponse as Response } from "next/server"

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // For mock authentication, we don't need middleware
  // Authentication is handled client-side with Zustand
  return Response.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
