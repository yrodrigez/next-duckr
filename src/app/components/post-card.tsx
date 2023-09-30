'use client'
import {Card, CardHeader, CardBody, CardFooter} from "@nextui-org/react";
import {IconMessageCircle, IconRepeat, IconChartBar, IconShare} from '@tabler/icons-react';
import moment from "moment";
import {type Post} from "@/app/types/posts";
import {LikeButton} from "./like-button-client";
import {AvatarClient} from "./avatar-client";
import Link from "next/link";
import {Reply} from "./reply-button-client";
import {useRouter} from "next/navigation";
import {InteractionsActions} from "@/app/components/interactions-client";

export function DuckHeader({
                               post,
                               isReplying
                           }: { post: Post, isReplying?: boolean }) {
    const {
        content,
        user,
        created_at
    } = post
    const {
        name: userFullName,
        user_name: userName,
        avatar_url: avatarUrl,

    } = user
    let typedAvatarUrl: string | undefined = avatarUrl as string | undefined
    const momentDate = moment(created_at)
    const formattedDate = moment().diff(momentDate, 'days') > 0 ? momentDate.format('MMM DD, YYYY') : momentDate.fromNow()
    return (
        <>
            <CardHeader className="justify-between items-start flex flex-col">
                <div className={`flex gap-${isReplying ? '1' : '3'}`}>
                    <Link href={`/${userName}`} className="z-10">
                        <AvatarClient radius="full" size="md" src={typedAvatarUrl}/>
                    </Link>
                    <div
                        className={`flex ${isReplying ? '' : 'flex-col'} gap-${isReplying ? '1' : '1'} ${isReplying ? 'items-baseline' : 'items-start'}`}>
                        <h4 className="text-small font-semibold leading-none text-default-600">{userFullName}</h4>
                        <h5 className="text-small tracking-tight text-default-400">@{userName || userFullName} · {formattedDate}</h5>
                    </div>
                </div>
                {isReplying ? <p className="ml-12">
                    {content}
                </p> : ''}
            </CardHeader>
            {
                isReplying ? '' : <CardBody className="px-3 gap-3 py-0 text-small text-white-400">
                    <p className="ml-12">
                        {content}
                    </p>
                </CardBody>
            }
        </>

    )
}

export function PostCard({
                             post,
                             addOptimisticPost
                         }: { post: Post, addOptimisticPost: any }) {
    const router = useRouter()

    return (
        <div className="duck-card w-screen max-w-[600px]" onClick={(e) => {
            e.preventDefault()
            router.push(`/${post.user.user_name || post.user.name?.split(' ')[0]}/status/${post.id}`)
        }}>
            <Card
                className="cursor-pointer max-w-[600px] bg-transparent shadow-none border-b border-t border-white/20 hover:bg-slate-100/10 "
                radius="none">
                <DuckHeader post={post}/>
                <CardFooter>
                    <InteractionsActions
                        className="w-full flex justify-evenly text-gray-500"
                        showCount
                        post={post}
                        addPostOptimistic={addOptimisticPost}
                    />
                </CardFooter>
            </Card>
        </div>

    );
}
