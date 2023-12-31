import './globals.css'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import {Providers} from './providers'
import {createServerComponentClient} from '@supabase/auth-helpers-nextjs'
import {cookies} from 'next/headers'
import {Database} from './types/database'
import {IconHome2} from "@tabler/icons-react";

import Link from "next/link";
import {PanelChatsButton} from "@/app/components/chat/panel-chats-button-client";
import {Section} from "@/app/components/section-server";
import {UserOptions} from "@/app/components/auth-button-client";

export const dynamic = 'force-dynamic'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'Duckr',
    description: 'Is finally duckr here?',
}

const UserPanel = async () => {
    const database = createServerComponentClient<Database>({cookies})
    const {data: {session}} = await database.auth.getSession()
    return (
        <>
            <div className="flex md:flex-col align-middle gap-8">
                <Link href={'/'}>
                    <IconHome2 size={40} color="white" className="m-0"/>
                </Link>
                {
                    session && <Link href={'/chats'}>
                    <PanelChatsButton/>
                  </Link>
                }
            </div>
            {session && <UserOptions user={session?.user}/>}
        </>
    )
}

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode,

}) {
    const database = createServerComponentClient<Database>({cookies})
    const {data: {session}} = await database.auth.getSession()

    return (
        <html lang="en" className="dark ">
        <body className={`${inter.className} h-screen bg-black`} >
        <Providers>
            <div className="flex bg-black h-full">
                <header className="z-3 justify-end items-end grow md:flex hidden">
                    <div className="fixed h-[100%] top-0">
                        <div className="mt-auto flex flex-col justify-between h-[100%] py-6 px-3 w-[68px]">
                            <UserPanel/>
                        </div>
                    </div>
                </header>
                <main className="flex flex-col items-center md:items-start justify-between grow h-full">
                    <Section className="flex flex-col">
                        {children}
                        <div
                            className="md:hidden align-middle max-w-[600px] w-full h-[65px] bottom-0 border-t border-white/30 flex justify-between items-center py-3 px-6 bg-black">
                            <UserPanel/>
                        </div>
                    </Section>
                </main>
            </div>
        </Providers>
        </body>
        </html>
    )
}
