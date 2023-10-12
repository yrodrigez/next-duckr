// app/providers.tsx
'use client'

import {NextUIProvider} from '@nextui-org/react'
import {useEffect, type ReactNode} from 'react'
import ChatMessagesReadContext from "@/app/components/context-providers/chat-messages-read-context";
import SessionContext from "@/app/components/context-providers/session-context";

export function Providers({
                              children
                          }: { children: ReactNode }) {

    const resizeManager = (window: Window) => {
        if (!window) return
        const h = window.innerHeight
        document.body.style.height = `${h}px`
    }

    useEffect(() => {
        try {
            window.addEventListener('resize', () => resizeManager(window))
            resizeManager(window)
        } catch (e) {
            return;
        }
    });

    return (
        <NextUIProvider>
            <SessionContext>
                <ChatMessagesReadContext>
                    {children}
                </ChatMessagesReadContext>
            </SessionContext>
        </NextUIProvider>
    )
}
