import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/adeeme/login') return NextResponse.next()

  const token = request.cookies.get('adm_token')?.value
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.redirect(new URL('/adeeme/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/adeeme', '/adeeme/:path*'],
}
