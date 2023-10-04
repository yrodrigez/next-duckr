// app/providers.tsx
'use client'

import {NextUIProvider} from '@nextui-org/react'
import {type Session} from '@supabase/auth-helpers-nextjs'
import {createContext, useState, useEffect} from 'react'
import {redirect, usePathname} from "next/navigation";
import {MessageReadEvent, useChatMessagesRead} from "@/app/components/chat/chat-messages-read-hook";

export const SessionContext = createContext({} as Session | null)
export const ChatMessagesReadContext = createContext<MessageReadEvent[]>([]);

export function Providers({
                              session,
                              children
                          }: { session: Session | null, children: React.ReactNode }) {
    const [statedSession, setSession] = useState<Session | null>(session)
    const pathName = usePathname()
    const {user} = statedSession || {}
    const chatMessagesRead = useChatMessagesRead()

    if (!user && pathName !== '/login') {
        redirect('/login')
    } else if (user && !user.user_metadata?.user_name && pathName !== '/login/update-user-name') {
        redirect('/login/update-user-name')
    }

    (() => {
        const resizeManager = (window: any) => {
            if (!window) return
            const h = window.innerHeight
            document.body.style.height = `${h}px`
        }
        try {
            window.addEventListener('resize', () => resizeManager(window))
            resizeManager(window)
        } catch (e) {
            return;
        }
    })()

    return (
        <NextUIProvider>
            <SessionContext.Provider value={{
                sessionContext: statedSession,
                setSession
            } as any}>
                <ChatMessagesReadContext.Provider value={chatMessagesRead}>
                    {children}
                </ChatMessagesReadContext.Provider>
            </SessionContext.Provider>
        </NextUIProvider>
    )
}
