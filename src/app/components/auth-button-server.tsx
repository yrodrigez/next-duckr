import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { AuthButtonClient } from "./auth-button-client";
export const dynamic = 'force-dynamic'

export async function AuthButtonServer() {
    const database = createServerComponentClient({ cookies })
    const { data: { session } } = await database.auth.getSession()

    return <AuthButtonClient session={session}/>
}
