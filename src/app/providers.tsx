// app/providers.tsx
'use client'

import {NextUIProvider} from '@nextui-org/react'
import {createClientComponentClient, type Session} from '@supabase/auth-helpers-nextjs'
import {createContext, useState, useEffect} from 'react'
import {redirect, usePathname} from "next/navigation";

const SessionContext = createContext({} as Session | null)
export {SessionContext}

export function Providers({session, children}: { session: Session | null, children: React.ReactNode }) {
    const [statedSession, setSession] = useState<Session | null>(session)
    const pathName = usePathname()
    const {user} = statedSession || {}

    if(!user && pathName !== '/login')
        redirect('/login')
    else if (user && !user.user_metadata?.user_name && pathName !== '/login/update-user-name')
        redirect('/login/update-user-name')
    return (
        <NextUIProvider>
            <SessionContext.Provider value={{sessionContext: statedSession, setSession} as any}>
                {children}
            </SessionContext.Provider>
        </NextUIProvider>
    )
}
