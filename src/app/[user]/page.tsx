import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/app/types/database";
import {cookies} from "next/headers";
import {AvatarClient} from "@/app/components/avatar-client";
import React from "react";

import {PostsList} from "@/app/components/posts-list";
import {FollowButton} from "@/app/components/follow-button-client";
import {TabView} from "@/app/components/tab-view-client";
import {IconPhotoPlus} from "@tabler/icons-react";
import {UserBanner} from "@/app/components/profile/user-banner";

export const dynamic = 'force-dynamic'
export default async function Page({
                                       params
                                   }: { params: { user: string } }) {
    const database = createServerComponentClient<Database>({cookies})
    const {data: user} = await database.from('users')
        .select('*, followers:follows!follows_user_id_fkey(*), following:follows!follows_follower_id_fkey(*)')
        .filter('user_name', 'eq', params.user)
        .single()

    const {data: userPosts} = await database.from('posts')
        .select('*, user:users(*), likes(*), replies:posts(id, content, created_at, user:users(*), likes(*))')
        .filter('user_id', 'eq', user?.id)
        .order('created_at', {ascending: false})

    const posts = userPosts?.filter((post) => !post.post_id) || []
    const replies = userPosts?.filter((post) => !!post.post_id) || []
    const {data: {session}} = await database.auth.getSession()

    return (
        <div className="h-full overflow-auto flex flex-col">
            <UserBanner user={{id: user?.id}}/>
            <div className="px-6 pt-3 w-[100%] flex justify-between">
                <div className="overflow-visible pb-2 -mt-[15%]">
                    <AvatarClient className="w-32 h-32" radius="full" size="md" src={user?.avatar_url}/>
                </div>
                <div className="flex flex-col gap-1">
                    <FollowButton
                        userToFollow={user}
                        follows={user?.followers}
                        currentUserId={session?.user?.id}
                    />
                </div>
            </div>
            <div className="p-6 w-[100%] flex flex-col">
                <span className="font-bold text-xl text-white">{user?.name}</span>
                <span className="text-gray-500 text-sm">@{user?.user_name}</span>
            </div>
            <div className="p-6 w-[100%] flex gap-3">
                <div className="flex text-sm">{user?.following?.length || 0}<span
                    className="ml-1 text-gray-500 text-sm">Following</span></div>
                <div className="flex text-sm">{user?.followers?.length || 0}<span
                    className="ml-1 text-gray-500 text-sm">Followers</span></div>
            </div>
            <TabView
                tabs={[
                    {
                        label: 'Posts',
                        name: 'posts',
                        children: <PostsList posts={posts}/>
                    },
                    {
                        label: 'Replies',
                        name: 'replies',
                        children: <PostsList posts={replies}/>
                    }
                ]}/>
        </div>
    )
}
