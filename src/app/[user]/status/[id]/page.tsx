import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/app/types/database";
import {cookies} from "next/headers";
import Link from "next/link";
import {AvatarClient} from "@/app/components/avatar-client";
import moment from "moment/moment";
import {DuckViewFooterClient} from "@/app/components/duck-view-footer-client";
import {CreatePost} from "@/app/components/create-post-server";
import React from "react";

import {PostsList} from "@/app/components/posts-list";

export const dynamic = 'force-dynamic'
export default async function Page({
                                       params
                                   }: { params: { user: string, id: string } }) {
    const database = createServerComponentClient<Database>({cookies})
    const {
        data: post
    } = await database.from('posts')
        .select('*, user:users(*), likes(*), replies:posts(id, content, created_at, user:users(*), likes(*), replies:posts(id))')
        .filter('id', 'eq', params.id)
        .single()

    const {data: {session}} = await database.auth.getSession()

    const {
        user_name: userName,
        name: userFullName,
        avatar_url: avatarUrl,
    } = post?.user as any

    const {
        content,
        created_at,
        replies
    } = post as any

    const momentDate = moment(created_at)
    let typedAvatarUrl = avatarUrl as string
    return (
        <section className="border-l border-r border-white/30 max-w-[600px] w-screen h-screen">
            <div
                className="bg-transparent shadow-none px-6"
            >
                <div className="gap-3 justify-between items-start flex flex-col mt-4">
                    <div className={`flex gap-3`}>
                        <Link href={`/${userName}`}>
                            <AvatarClient radius="full" size="md" src={typedAvatarUrl}/>
                        </Link>
                        <div className={`flex flex-col gap-1`}>
                            <h4 className="text-small font-semibold leading-none text-default-600">{userFullName}</h4>
                            <h5 className="text-small tracking-tight text-default-400">@{userName || userFullName}</h5>
                        </div>
                    </div>
                </div>
                <div className="gap-3 py-0 text-small text-white-400 mt-6">
                    <p className="break-all">
                        {content}
                    </p>
                </div>
                <div className="gap-3 py-0 text-small text-white-400 mt-6">
                    <div className="pb-3 text-default-400">
                        {momentDate.format('hh:mm A')} · {momentDate.format('MMM DD, YYYY')}
                    </div>
                    <DuckViewFooterClient post={post}/>
                </div>
            </div>
            {session ? (
                <div className="px-6 border-b border-white/30">
                    <CreatePost
                        postId={post?.id}
                        noBorder
                        placeholder="Post your reply!"
                        avatarUrl={session.user?.user_metadata?.avatar_url}
                    />
                </div>
            ) : null}
            {replies?.length ? (
                <PostsList
                    posts={(replies as any[]).sort((x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime())}/>
            ) : null}
        </section>
    )
}
