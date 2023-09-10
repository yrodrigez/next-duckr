'use client'
import {type SupabaseClient, createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {IconHeart, IconHeartFilled} from "@tabler/icons-react";
import {useContext, useState} from "react";
import {type Post} from "@/app/types/posts";
import {SessionContext} from "@/app/providers";

const tryToLike = ({
                       postId,
                       userId,
                       database
                   }: { postId: string | null, userId: string, database: SupabaseClient }) => {
    return database.from('likes').insert({
        post_id: postId,
        user_id: userId
    })
}

const tryToUnlike = ({
                         postId,
                         userId,
                         database
                     }: { postId: string | null, userId: string, database: SupabaseClient }) => {
    return database.from('likes').delete().match({
        post_id: postId,
        user_id: userId
    })
}

export function LikeButton({
                               post,
                               addOptimisticPost,
                               iconSize,
                               showCount
                           }: { post: any, addOptimisticPost: any, iconSize?: number | string, showCount?: boolean }) {
    const {
        id: postId,
    } = post
    const isReply = !!postId
    const [likes, setLikes] = useState(post?.likes || [])
    const database = createClientComponentClient()
    const {sessionContext} = useContext(SessionContext) as any
    const user = sessionContext?.user
    const [wasLiked, setWasLiked] = useState(likes?.some((x: any) => x.user_id === user?.id))
    const [isDisabled, setIsDisabled] = useState(false)

    const like = async (e: any) => {
        e.stopPropagation()
        if (!user) return
        const userId = user.id
        if (!userId) return

        setIsDisabled(true)
        if (wasLiked) {
            tryToUnlike({
                postId,
                userId,
                database: database
            }).then(({error}) => {
                if (error) return
                const newPost = {
                    ...post,
                    likes: likes?.filter((x: any) => x.user_id !== userId)
                }
                setLikes(newPost.likes)
                addOptimisticPost(newPost)
                setWasLiked(false)
            })
        } else {
            tryToLike({
                postId,
                userId,
                database: database
            }).then(({error}) => {
                if (error) return
                const newPost = {
                    ...post,
                    likes: [...likes, {
                        post_id: postId,
                        user_id: userId
                    }]
                } as any
                setLikes(newPost.likes)
                addOptimisticPost(newPost)
                setWasLiked(true)
            })
        }
        setIsDisabled(false)
    }

    return (
        <button disabled={isDisabled} onClick={like}
                className="group flex gap-2 items-center ">
            <div className="relative">
                {wasLiked ? <IconHeartFilled
                        className={`${iconSize ? `w-${iconSize} h-${iconSize}` : 'w-4 h-4'} group-hover:text-pink-700 transition-all`}/> :
                    <IconHeart
                        className={`${iconSize ? `w-${iconSize} h-${iconSize}` : 'w-4 h-4'} text-gray-500 group-hover:text-pink-700 transition-all`}/>}
                <div
                    className="transition-all rounded-full group-hover:bg-pink-700/20 absolute -left-2 -right-2 -top-2 -bottom-2"/>
            </div>
            {likes.length && showCount ?
                <span className="text-sm group-hover:text-pink-700">{likes.length}</span> : null}

        </button>
    )
}
