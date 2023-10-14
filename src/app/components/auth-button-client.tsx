'use client'
import {Session, createClientComponentClient} from "@supabase/auth-helpers-nextjs"
import {GithubIcon} from "./github-icon"
import {redirect, useRouter} from 'next/navigation'
import {AvatarClient} from "@/app/components/avatar-client"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    useDisclosure,
    Button,
} from "@nextui-org/react"
import React, {useEffect, useState} from "react"
import Link from "next/link"
import {IconUser, IconLogout} from "@tabler/icons-react"

type Provider =
    | 'apple'
    | 'azure'
    | 'bitbucket'
    | 'discord'
    | 'facebook'
    | 'figma'
    | 'github'
    | 'gitlab'
    | 'google'
    | 'kakao'
    | 'keycloak'
    | 'linkedin'
    | 'notion'
    | 'slack'
    | 'spotify'
    | 'twitch'
    | 'twitter'
    | 'workos'
    | 'zoom'

export function LogOutButton({
                                 user,
                             }: {
    user?: Session['user'],

}) {
    const router = useRouter()
    const database = createClientComponentClient()

    const [userName, setUserName] = useState(user?.user_metadata?.user_name)

    const handleSignOut = async () => {
        await database.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <Button
            className="flex items-center gap-2 text-white"
            onClick={handleSignOut}>
            <IconLogout/>
            Log out
        </Button>
    )
}

export function UserOptions({user}: {
    user: Session['user']
}) {

    const {
        isOpen,
        onOpenChange
    } = useDisclosure();

    return (
        <Popover
            isOpen={isOpen}
            showArrow
            onOpenChange={onOpenChange}
            defaultOpen={false}
            placement="top-start"

        >
            <PopoverTrigger>
                <Button radius="full" disableRipple isIconOnly
                        className="hover:ring-white/20 hover:ring-8 bg-transparent">
                    <AvatarClient
                        className="w-10 h-10"
                        radius="full"
                        size="md"
                        src={user?.user_metadata?.avatar_url}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                {(triggerProps) => (
                    <div className="flex flex-col p-3 w-full gap-2" {...triggerProps}>
                        <span className="text-xs text-gray-500">
                            {user?.user_metadata?.user_name}
                        </span>
                        <Button>
                            <Link href={`/${user?.user_metadata?.user_name}`}
                                  className="flex items-center gap-2 text-white"
                            >
                                <IconUser/> Profile
                            </Link>
                        </Button>
                        <LogOutButton user={user}/>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}

export function AuthButtonClient({
                                     session,
                                     redirectUrl
                                 }: any) {
    const database = createClientComponentClient()
    const handleSignIn = async (provider: Provider) => {
        try {
            return await database.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${location.origin}/auth/callback${redirectUrl && `?redirectedFrom=${redirectUrl}`}`
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (session && !session.user?.user_metadata?.user_name) {
            redirect(`/login/update-user-name${redirectUrl && `?redirectedFrom=${redirectUrl}`}`)
        }
    });

    return (
        session === null ?
            <div className="flex flex-col">
                <button onClick={() => handleSignIn('github')} type="button"
                        className="text-white bg-[#24292F] hover:bg-[#24292F]/30 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#24292f]/80 mr-2 mb-2">
                    <GithubIcon/>
                    Sign in with Github
                </button>
                <button onClick={() => handleSignIn('google')} type="button"
                        className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2">
                    <svg className="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                         fill="currentColor" viewBox="0 0 18 19">
                        <path fillRule="evenodd"
                              d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
                              clipRule="evenodd"/>
                    </svg>
                    Sign in with Google
                </button>
            </div>
            : null
    )
}
