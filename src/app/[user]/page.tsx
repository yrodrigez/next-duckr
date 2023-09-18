import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/app/types/database";
import {cookies} from "next/headers";
import Link from "next/link";
import {AvatarClient} from "@/app/components/avatar-client";
import moment from "moment/moment";
import {DuckViewFooterClient} from "@/app/components/duck-view-footer-client";
import React from "react";

import {PostsList} from "@/app/components/posts-list";
import {FollowButton} from "@/app/components/follow-button-client";

export const dynamic = 'force-dynamic'
export default async function Page({
                                       params
                                   }: { params: { user: string } }) {
    const database = createServerComponentClient<Database>({cookies})
    const {data: user} = await database.from('users')
        .select('*, posts(id, content, created_at, user:users(*), likes(*), replies:posts(id)), followers:follows!follows_user_id_fkey(*), following:follows!follows_follower_id_fkey(*)')
        .filter('user_name', 'eq', params.user)
        .single()

    const {data: {session}} = await database.auth.getSession()

    return (
        <section className="border-l border-r border-white/30 max-w-[600px] w-screen h-screen">
            <div className="bg-transparent shadow-none">
                <div className="">
                    <div className="h-[200px] bg-violet-600 w-[100%]">
                    </div>
                    <div className="px-6 pt-3 w-[100%] flex justify-between">
                        <div className="overflow-visible pb-2 -mt-[15%]">
                            <AvatarClient className="w-32 h-32" radius="full" size="md" src={user?.avatar_url}/>
                        </div>
                        <div className="flex flex-col gap-1">
                            <FollowButton
                                userToFollow={user}
                                follows={user?.followers}
                                currentUserId={session?.user?.id}/>
                        </div>
                    </div>
                    <div className="p-6 w-[100%] flex flex-col">
                        <span className="font-bold text-xl">{user?.name}</span>
                        <span className="text-gray-500 text-sm">@{user?.user_name}</span>
                    </div>
                    <div className="p-6 w-[100%] flex gap-3">
                        <div className="flex text-sm">{user?.following?.length || 0}<span className="ml-1 text-gray-500 text-sm">Following</span></div>
                        <div className="flex text-sm">{user?.followers?.length || 0}<span className="ml-1 text-gray-500 text-sm">Followers</span></div>
                    </div>
                </div>
            </div>
        </section>
    )
}
