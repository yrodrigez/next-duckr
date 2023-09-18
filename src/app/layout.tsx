import './globals.css'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import {Providers} from './providers'
import {createServerComponentClient} from '@supabase/auth-helpers-nextjs'
import {cookies} from 'next/headers'
import {Database} from './types/database'
import {AuthButtonServer} from "@/app/components/auth-button-server";
import {IconHome2} from "@tabler/icons-react";

import Link from "next/link";
export const dynamic = 'force-dynamic'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'Duckr',
    description: 'Is finally duckr here?',
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
        <body className={`${inter.className} min-h-full bg-black`}>
        <Providers session={session}>
            <div className="flex">
                <header className="flex z-3 justify-end items-end grow">
                    <div className="fixed h-[100%] top-0">
                        {
                            session && <div className="mt-auto flex flex-col justify-between h-[100%] py-6 px-3 w-[68px]">
                            <div className="flex flex-col align-middle">
                              <Link href={'/'}>
                                <IconHome2 size={40} color="white" className="m-0"/>
                              </Link>
                            </div>
                            <AuthButtonServer/>
                          </div>
                        }
                    </div>
                </header>
                <main className="flex flex-col items-start justify-between grow h-screen ">
                    {children}
                </main>
            </div>
        </Providers>
        </body>
        </html>
    )
}
