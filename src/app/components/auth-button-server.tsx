import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies, headers} from "next/headers";

import {AuthButtonClient} from "./auth-button-client";

export const dynamic = 'force-dynamic'

export async function AuthButtonServer() {
    const headersList = headers();
    const fullUrl = headersList.get('referer') || ''

    let redirectUrl = ''
    try {
        const url = new URL(fullUrl)
        redirectUrl = decodeURIComponent(url.searchParams.get('redirectedFrom') || '')
    } catch (e) {
        // ignore
    }

    const database = createServerComponentClient({cookies})
    const {data: {session}} = await database.auth.getSession()

    return <AuthButtonClient session={session} redirectUrl={redirectUrl}/>
}
