import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth';

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });
    const url = request.nextUrl
    if(session && session.user.emailVerified &&(
        url.pathname.startsWith("/signin") ||
        url.pathname.startsWith("/signup")
    )){
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if(!session && url.pathname.startsWith("/dashboard")){
        return NextResponse.redirect(new URL('/signin', request.url))
    }
    if(session && url.pathname.startsWith("/dashboard") && !session.user.emailVerified){
        return NextResponse.redirect(new URL('/verifyEmail', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/signin',
        '/signup',
        '/dashboard/:path*'
    ],
}