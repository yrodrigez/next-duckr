import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {cookies, headers} from "next/headers";
import {NextResponse, type NextRequest} from "next/server";
const PRODUCTION = process.env.NODE_ENV === 'production'
const PRODUCTION_ORIGIN = 'https://www.duckrapp.com/'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const requestURL = new URL(request.url)
    const code = requestURL.searchParams.get('code')
    const redirect = decodeURIComponent(requestURL.searchParams.get('redirectedFrom') || '')
    if (code) {
        const database = createRouteHandlerClient({cookies})
        await database.auth.exchangeCodeForSession(code)
    }

    if (PRODUCTION) {
        return NextResponse.redirect(PRODUCTION_ORIGIN + redirect)
    }

    return NextResponse.redirect(requestURL.origin + redirect)
}
